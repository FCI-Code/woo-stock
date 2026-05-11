import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { WoocommerceOrderPayloadDto } from './dto/woocommerce-order.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleOrderEvent(
    tenantId: string,
    topic: string | undefined,
    payload: WoocommerceOrderPayloadDto,
  ) {
    const eventType = topic ?? 'order.unknown';
    const summary = {
      woo_order_id: payload.id,
      status: payload.status,
      total: payload.total,
      currency: payload.currency,
      customer_email: payload.billing?.email,
    };

    try {
      await this.ordersService.upsertFromWoo(tenantId, payload);
      await this.prisma.webhookLog.create({
        data: {
          tenant_id: tenantId,
          event_type: eventType,
          payload_summary: summary as Prisma.InputJsonValue,
          status: 'processed',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Failed to process ${eventType} for tenant ${tenantId}: ${message}`,
      );
      await this.prisma.webhookLog.create({
        data: {
          tenant_id: tenantId,
          event_type: eventType,
          payload_summary: summary as Prisma.InputJsonValue,
          status: 'error',
          error_message: message,
        },
      });
    }
  }
}
