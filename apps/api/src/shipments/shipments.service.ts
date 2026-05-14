import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateTrackingCode } from '../common/tracking/tracking-code.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForNewOrder(tenantId: string, orderId: string) {
    const existing = await this.prisma.shipment.findUnique({
      where: { order_id: orderId },
    });
    if (existing) return null;

    const trackingCode = generateTrackingCode();
    const shipment = await this.prisma.shipment.create({
      data: {
        tenant_id: tenantId,
        order_id: orderId,
        status: 'pending',
        tracking_code: trackingCode,
        quoted_options: {},
      },
    });
    await this.prisma.shipmentEvent.create({
      data: {
        tenant_id: tenantId,
        shipment_id: shipment.id,
        status: 'pending',
        description: 'Pedido recebido - aguardando processamento',
      },
    });
    return shipment;
  }

  async create(tenantId: string, dto: CreateShipmentDto) {
    const [shipment] = await this.prisma.$transaction([
      this.prisma.shipment.create({
        data: {
          tenant_id: tenantId,
          order_id: dto.order_id,
          carrier: dto.carrier,
          service: dto.service,
          status: dto.status,
          tracking_code: dto.tracking_code,
          label_url: dto.label_url,
          shipping_cost: dto.shipping_cost ?? 0,
          estimated_days: dto.estimated_days ?? 0,
          quoted_options: (dto.quoted_options ?? {}) as Prisma.InputJsonValue,
        },
      }),
    ]);

    await this.prisma.shipmentEvent.create({
      data: {
        tenant_id: tenantId,
        shipment_id: shipment.id,
        status: shipment.status,
        description: 'Shipment created',
      },
    });

    return shipment;
  }

  async findAll(tenantId: string, query: ListShipmentsQueryDto) {
    return this.prisma.shipment.findMany({
      where: {
        tenant_id: tenantId,
        ...(query.status && { status: query.status }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }

    const events = await this.prisma.shipmentEvent.findMany({
      where: { shipment_id: id, tenant_id: tenantId },
      orderBy: { occurred_at: 'asc' },
    });

    return { ...shipment, events };
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateShipmentStatusDto,
  ) {
    const existing = await this.prisma.shipment.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }

    const occurredAt = dto.occurred_at ? new Date(dto.occurred_at) : new Date();

    const [shipment, event] = await this.prisma.$transaction([
      this.prisma.shipment.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.shipmentEvent.create({
        data: {
          tenant_id: tenantId,
          shipment_id: id,
          status: dto.status,
          description: dto.description,
          location: dto.location,
          occurred_at: occurredAt,
        },
      }),
    ]);

    return { shipment, event };
  }
}
