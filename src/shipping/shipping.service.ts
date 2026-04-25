import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Order, Prisma, Shipment, Tenant } from '@prisma/client';
import { EncryptionService } from '../common/encryption/encryption.service';
import {
  MelhorEnvioCalculateOption,
  MelhorEnvioCartRequest,
  MelhorEnvioProduct,
} from '../integrations/melhor-envio/types';
import { MelhorEnvioService } from '../integrations/melhor-envio/melhor-envio.service';
import { WoocommerceService } from '../integrations/woocommerce/woocommerce.service';
import { PrismaService } from '../prisma/prisma.service';
import { LabelRequestDto } from './dto/label-request.dto';
import { QuoteItemDto, QuoteRequestDto } from './dto/quote-request.dto';

interface OrderItem {
  name?: string;
  qty?: number;
  price?: number;
  total?: string;
}

interface OrderShippingAddress {
  street?: string;
  complement?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface TenantOriginAddress {
  street?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
}

const DEFAULT_DIMENSIONS = {
  weight: 0.3,
  width: 11,
  height: 2,
  length: 16,
};

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly melhorEnvio: MelhorEnvioService,
    private readonly woocommerce: WoocommerceService,
  ) {}

  async quote(tenantId: string, dto: QuoteRequestDto) {
    const order = await this.getOrder(tenantId, dto.order_id);
    const tenant = await this.getTenant(tenantId);
    const token = this.requireMelhorEnvioToken(tenant);

    const fromZip = sanitizeZip(dto.from_zip ?? tenant.origin_zip);
    if (!fromZip) {
      throw new BadRequestException(
        'Origin zip not configured. Set tenant.origin_zip or pass from_zip.',
      );
    }

    const toZip = sanitizeZip(this.extractToZip(order));
    if (!toZip) {
      throw new BadRequestException('Order has no shipping postal code');
    }

    const products = this.buildProducts(order, dto.items);

    const options = await this.melhorEnvio.calculate(token, {
      from: { postal_code: fromZip },
      to: { postal_code: toZip },
      products,
      options: { receipt: false, own_hand: false, insurance_value: 0 },
    });

    const validOptions = options.filter((opt) => !opt.error);

    const shipment = await this.prisma.shipment.upsert({
      where: { order_id: order.id },
      create: {
        tenant_id: tenantId,
        order_id: order.id,
        status: 'quoted',
        quoted_options: validOptions as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: 'quoted',
        quoted_options: validOptions as unknown as Prisma.InputJsonValue,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'quoting' },
    });

    return {
      quote_id: shipment.id,
      options: validOptions.map(toPublicOption),
    };
  }

  async generateLabel(tenantId: string, dto: LabelRequestDto) {
    const order = await this.getOrder(tenantId, dto.order_id);
    const tenant = await this.getTenant(tenantId);
    const token = this.requireMelhorEnvioToken(tenant);

    const shipment = await this.prisma.shipment.findUnique({
      where: { order_id: order.id },
    });
    if (!shipment) {
      throw new UnprocessableEntityException(
        'No quote found for this order. Call POST /shipping/quote first.',
      );
    }
    if (shipment.status !== 'quoted') {
      throw new UnprocessableEntityException(
        `Shipment already in status "${shipment.status}"`,
      );
    }

    const quotedOptions = (shipment.quoted_options ?? []) as unknown as
      | MelhorEnvioCalculateOption[]
      | undefined;
    const matchedOption = (quotedOptions ?? []).find(
      (opt) =>
        opt.company?.name?.toLowerCase() === dto.selected_option.carrier.toLowerCase() &&
        opt.name?.toLowerCase() === dto.selected_option.service.toLowerCase(),
    );

    if (!matchedOption || matchedOption.error) {
      throw new UnprocessableEntityException(
        'Selected carrier/service is not available in the saved quote',
      );
    }

    const cartPayload = this.buildCartPayload(
      tenant,
      order,
      matchedOption,
    );

    const cartItem = await this.melhorEnvio.addToCart(token, cartPayload);
    await this.melhorEnvio.checkout(token, [cartItem.id]);
    const generated = await this.melhorEnvio.generate(token, [cartItem.id]);
    const printed = await this.melhorEnvio.print(token, [cartItem.id]);

    const trackingCode =
      generated[cartItem.id]?.tracking ?? generated[cartItem.id]?.message ?? null;
    const carrierName = matchedOption.company?.name ?? dto.selected_option.carrier;
    const serviceName = matchedOption.name ?? dto.selected_option.service;
    const cost = parsePrice(matchedOption);
    const estimatedDays =
      matchedOption.custom_delivery_time ?? matchedOption.delivery_time ?? null;

    const updated = await this.prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        melhor_envio_shipment_id: cartItem.id,
        carrier: carrierName,
        service: serviceName,
        shipping_cost: cost,
        estimated_days: estimatedDays ?? undefined,
        tracking_code: trackingCode,
        label_url: printed.url,
        status: 'label_generated',
      },
    });

    await this.prisma.shipmentEvent.create({
      data: {
        tenant_id: tenantId,
        shipment_id: shipment.id,
        status: 'label_generated',
        description: 'Label generated',
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'shipped' },
    });

    if (trackingCode) {
      await this.notifyWoocommerce(tenant, order.woo_order_id, trackingCode, carrierName);
    }

    return {
      shipment_id: updated.id,
      tracking_code: trackingCode,
      label_url: printed.url,
      carrier: carrierName,
      service: serviceName,
      cost,
    };
  }

  private async getOrder(tenantId: string, orderId: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenant_id: tenantId },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  private async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  private requireMelhorEnvioToken(tenant: Tenant): string {
    if (!tenant.melhor_envio_token_encrypted) {
      throw new BadRequestException(
        'Melhor Envio token not configured. Set it via PATCH /tenants/me.',
      );
    }
    return this.encryption.decrypt(tenant.melhor_envio_token_encrypted);
  }

  private extractToZip(order: Order): string | null {
    const addr = order.shipping_address as OrderShippingAddress | null;
    return addr?.postcode ?? null;
  }

  private buildProducts(
    order: Order,
    overrides?: QuoteItemDto[],
  ): MelhorEnvioProduct[] {
    if (overrides && overrides.length > 0) {
      return overrides.map((it, idx) => ({
        id: String(idx + 1),
        weight: it.weight,
        width: it.width,
        height: it.height,
        length: it.length,
        quantity: it.qty,
        insurance_value: it.insurance_value ?? 0,
      }));
    }

    const items = (order.items ?? []) as unknown as OrderItem[];
    if (items.length === 0) {
      return [
        {
          id: '1',
          ...DEFAULT_DIMENSIONS,
          quantity: 1,
          insurance_value: 0,
        },
      ];
    }

    return items.map((item, idx) => ({
      id: String(idx + 1),
      ...DEFAULT_DIMENSIONS,
      quantity: item.qty ?? 1,
      insurance_value: item.price ?? 0,
    }));
  }

  private buildCartPayload(
    tenant: Tenant,
    order: Order,
    option: MelhorEnvioCalculateOption,
  ): MelhorEnvioCartRequest {
    const fromAddress = tenant.origin_address as TenantOriginAddress | null;
    const toAddress = order.shipping_address as OrderShippingAddress | null;
    const items = (order.items ?? []) as unknown as OrderItem[];

    const products = items.length
      ? items.map((it) => ({
          name: it.name ?? 'Item',
          quantity: it.qty ?? 1,
          unitary_value: it.price ?? 0,
        }))
      : [{ name: 'Item', quantity: 1, unitary_value: 0 }];

    const volumes = items.length
      ? items.map(() => ({ ...DEFAULT_DIMENSIONS }))
      : [{ ...DEFAULT_DIMENSIONS }];

    return {
      service: option.id,
      from: {
        name: tenant.name ?? 'Loja',
        address: fromAddress?.street ?? fromAddress?.address ?? 'Endereço',
        complement: fromAddress?.complement,
        number: fromAddress?.number ?? 's/n',
        district: fromAddress?.district ?? 'Centro',
        city: fromAddress?.city ?? 'Cidade',
        state_abbr: fromAddress?.state ?? 'SP',
        country_id: 'BR',
        postal_code: sanitizeZip(tenant.origin_zip) ?? '',
      },
      to: {
        name: order.customer_name,
        email: order.customer_email,
        address: toAddress?.street ?? 'Endereço',
        complement: toAddress?.complement,
        number: 's/n',
        district: 'Centro',
        city: toAddress?.city ?? 'Cidade',
        state_abbr: toAddress?.state ?? 'SP',
        country_id: toAddress?.country ?? 'BR',
        postal_code: sanitizeZip(toAddress?.postcode) ?? '',
      },
      products,
      volumes,
      options: {
        insurance_value: products.reduce(
          (acc, p) => acc + p.unitary_value * p.quantity,
          0,
        ),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true,
        platform: 'WooStock',
      },
    };
  }

  private async notifyWoocommerce(
    tenant: Tenant,
    wooOrderId: number,
    trackingCode: string,
    carrierLabel: string,
  ): Promise<void> {
    if (
      !tenant.woo_consumer_key_encrypted ||
      !tenant.woo_consumer_secret_encrypted
    ) {
      this.logger.warn(
        `Tenant ${tenant.id} has no WooCommerce credentials — skipping outbound update`,
      );
      return;
    }

    try {
      await this.woocommerce.updateOrderTracking(
        {
          storeUrl: tenant.store_url,
          consumerKey: this.encryption.decrypt(tenant.woo_consumer_key_encrypted),
          consumerSecret: this.encryption.decrypt(
            tenant.woo_consumer_secret_encrypted,
          ),
        },
        wooOrderId,
        trackingCode,
        carrierLabel,
      );
      await this.prisma.webhookLog.create({
        data: {
          tenant_id: tenant.id,
          event_type: 'outbound.order.tracking_updated',
          payload_summary: {
            woo_order_id: wooOrderId,
            tracking_code: trackingCode,
          } as Prisma.InputJsonValue,
          status: 'processed',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Failed to update Woo order ${wooOrderId} for tenant ${tenant.id}: ${message}`,
      );
      await this.prisma.webhookLog.create({
        data: {
          tenant_id: tenant.id,
          event_type: 'outbound.order.tracking_updated',
          payload_summary: {
            woo_order_id: wooOrderId,
            tracking_code: trackingCode,
          } as Prisma.InputJsonValue,
          status: 'error',
          error_message: message,
        },
      });
    }
  }
}

function sanitizeZip(zip: string | null | undefined): string | null {
  if (!zip) return null;
  const digits = zip.replace(/\D/g, '');
  return digits.length === 8 ? digits : digits || null;
}

function parsePrice(option: MelhorEnvioCalculateOption): number {
  const raw = option.custom_price ?? option.price;
  if (!raw) return 0;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPublicOption(option: MelhorEnvioCalculateOption) {
  return {
    id: option.id,
    carrier: option.company?.name ?? null,
    service: option.name,
    cost: parsePrice(option),
    estimated_days: option.custom_delivery_time ?? option.delivery_time ?? null,
    company_picture: option.company?.picture ?? null,
  };
}

export type IShipment = Shipment;
