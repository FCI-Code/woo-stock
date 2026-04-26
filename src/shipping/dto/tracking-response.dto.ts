import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';

export class TrackingEventDto {
  @ApiProperty({ enum: ['preparation', 'shipment'] })
  type: 'preparation' | 'shipment';

  @ApiProperty()
  status: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ nullable: true })
  location: string | null;

  @ApiProperty()
  occurred_at: Date;
}

class TrackingOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  woo_order_id: number;

  @ApiProperty()
  customer_name: string;

  @ApiProperty()
  customer_email: string;
}

export class TrackingResponseDto {
  @ApiProperty()
  tracking_code: string;

  @ApiProperty({ enum: ShipmentStatus })
  current_status: ShipmentStatus;

  @ApiPropertyOptional({ nullable: true })
  carrier: string | null;

  @ApiPropertyOptional({ nullable: true })
  service: string | null;

  @ApiPropertyOptional({ nullable: true })
  estimated_days: number | null;

  @ApiPropertyOptional({ nullable: true })
  label_url: string | null;

  @ApiProperty({ type: TrackingOrderDto })
  order: TrackingOrderDto;

  @ApiProperty({ type: [TrackingEventDto] })
  timeline: TrackingEventDto[];
}
