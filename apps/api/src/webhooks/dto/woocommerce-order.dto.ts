import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export interface WoocommerceBilling {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface WoocommerceShipping {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface WoocommerceLineItem {
  id?: number;
  name?: string;
  product_id?: number;
  variation_id?: number;
  quantity?: number;
  sku?: string;
  price?: number;
  total?: string;
}

export class WoocommerceOrderPayloadDto {
  @ApiProperty({ description: 'WooCommerce order ID' })
  @IsInt()
  id!: number;

  @ApiProperty({ description: 'WooCommerce order status (pending, processing, completed, etc.)' })
  @IsString()
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  total?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  billing?: WoocommerceBilling;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  shipping?: WoocommerceShipping;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsOptional()
  @IsArray()
  line_items?: WoocommerceLineItem[];
}
