import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class QuoteItemDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  width!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  height!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  length!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  qty!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  insurance_value?: number;
}

export class QuoteRequestDto {
  @ApiProperty({ description: 'WooStock order id' })
  @IsString()
  @IsNotEmpty()
  order_id!: string;

  @ApiPropertyOptional({ description: 'Override origin zip (defaults to tenant.origin_zip)' })
  @IsOptional()
  @IsString()
  from_zip?: string;

  @ApiPropertyOptional({ type: [QuoteItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items?: QuoteItemDto[];
}
