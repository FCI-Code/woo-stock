import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ description: 'WooCommerce store URL' })
  @IsUrl()
  store_url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Origin zip code for shipping quotes' })
  @IsOptional()
  @IsString()
  origin_zip?: string;

  @ApiPropertyOptional({ description: 'Origin address for shipping quotes' })
  @IsOptional()
  @IsObject()
  origin_address?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'WooCommerce consumer key' })
  @IsOptional()
  @IsString()
  woo_consumer_key?: string;

  @ApiPropertyOptional({ description: 'WooCommerce consumer secret' })
  @IsOptional()
  @IsString()
  woo_consumer_secret?: string;

  @ApiPropertyOptional({ description: 'Melhor Envio access token' })
  @IsOptional()
  @IsString()
  melhor_envio_token?: string;
}
