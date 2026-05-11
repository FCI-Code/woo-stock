import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiProperty({ description: 'Human-readable description of the event' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'City, state or hub name' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date string, defaults to now' })
  @IsOptional()
  @IsDateString()
  occurred_at?: string;
}
