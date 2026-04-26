import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  label_generated: 'posted',
  posted: 'in_transit',
  in_transit: 'delivered',
};

const MOCK_DESCRIPTIONS: Partial<Record<ShipmentStatus, string>> = {
  posted: 'Pedido coletado para transporte',
  in_transit: 'Pedido em trânsito',
  delivered: 'Pedido entregue ao destinatário',
};

const ACTIVE_STATUSES: ShipmentStatus[] = [
  'label_generated',
  'posted',
  'in_transit',
];

@Injectable()
export class DeliverySimulatorService {
  private readonly logger = new Logger(DeliverySimulatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async advanceDeliveries(): Promise<void> {
    if (process.env.DELIVERY_MOCK_ENABLED !== 'true') {
      return;
    }

    const active = await this.prisma.shipment.findMany({
      where: { status: { in: ACTIVE_STATUSES } },
    });

    if (active.length === 0) {
      return;
    }

    this.logger.log(`Advancing ${active.length} mock shipment(s)`);

    for (const shipment of active) {
      const next = NEXT_STATUS[shipment.status];
      if (!next) continue;

      const description = MOCK_DESCRIPTIONS[next] ?? `Status: ${next}`;
      const syncOrder = next === 'in_transit' || next === 'delivered';

      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.shipment.update({
            where: { id: shipment.id },
            data: { status: next },
          });
          await tx.shipmentEvent.create({
            data: {
              tenant_id: shipment.tenant_id,
              shipment_id: shipment.id,
              status: next,
              description,
            },
          });
          if (syncOrder) {
            await tx.order.update({
              where: { id: shipment.order_id },
              data: { status: next },
            });
          }
        });

        this.logger.log(`Shipment ${shipment.id}: ${shipment.status} → ${next}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to advance shipment ${shipment.id}: ${message}`,
        );
      }
    }
  }
}
