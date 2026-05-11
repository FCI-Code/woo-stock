import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty()
  @IsString()
  order_id: string;

  @ApiProperty()
  @IsString()
  carrier: string;

  @ApiProperty()
  @IsString()
  service: string;

  @ApiProperty({ enum: ShipmentStatus, default: ShipmentStatus.quoted })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tracking_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label_url?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  shipping_cost?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  estimated_days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  quoted_options?: Record<string, unknown>;
}
