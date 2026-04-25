import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WoocommerceOrderPayloadDto } from '../webhooks/dto/woocommerce-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromWoo(tenantId: string, payload: WoocommerceOrderPayloadDto) {
    const status = mapWooStatusToOrderStatus(payload.status);
    const customerName = buildCustomerName(payload);
    const customerEmail = payload.billing?.email ?? '';
    const shippingAddress = buildShippingAddress(payload);
    const items = (payload.line_items ?? []).map((item) => ({
      name: item.name,
      sku: item.sku,
      qty: item.quantity,
      product_id: item.product_id,
      variation_id: item.variation_id,
      price: item.price,
      total: item.total,
    }));

    return this.prisma.order.upsert({
      where: {
        tenant_id_woo_order_id: {
          tenant_id: tenantId,
          woo_order_id: payload.id,
        },
      },
      create: {
        tenant_id: tenantId,
        woo_order_id: payload.id,
        status,
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_address: shippingAddress as Prisma.InputJsonValue,
        items: items as unknown as Prisma.InputJsonValue,
        total_weight: 0,
      },
      update: {
        status,
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_address: shippingAddress as Prisma.InputJsonValue,
        items: items as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(tenantId: string, query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      tenant_id: tenantId,
      ...(query.status && { status: query.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const shipment = await this.prisma.shipment.findFirst({
      where: { order_id: id, tenant_id: tenantId },
    });

    return { ...order, shipment };
  }
}

function mapWooStatusToOrderStatus(wooStatus: string): OrderStatus {
  switch (wooStatus) {
    case 'pending':
    case 'on-hold':
      return 'received';
    case 'processing':
      return 'ready_to_ship';
    case 'completed':
      return 'shipped';
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return 'error';
    default:
      return 'received';
  }
}

function buildCustomerName(payload: WoocommerceOrderPayloadDto): string {
  const billingName = [payload.billing?.first_name, payload.billing?.last_name]
    .filter(Boolean)
    .join(' ');
  if (billingName) return billingName;
  const shippingName = [payload.shipping?.first_name, payload.shipping?.last_name]
    .filter(Boolean)
    .join(' ');
  return shippingName || 'Unknown';
}

function buildShippingAddress(payload: WoocommerceOrderPayloadDto) {
  const s = payload.shipping;
  return {
    street: s?.address_1 ?? '',
    complement: s?.address_2 ?? '',
    city: s?.city ?? '',
    state: s?.state ?? '',
    postcode: s?.postcode ?? '',
    country: s?.country ?? '',
  };
}
