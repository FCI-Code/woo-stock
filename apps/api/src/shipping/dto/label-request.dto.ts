import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SelectedOptionDto {
  @ApiProperty({ description: 'Carrier name (e.g. Correios, Jadlog)' })
  @IsString()
  @IsNotEmpty()
  carrier!: string;

  @ApiProperty({ description: 'Service name (e.g. SEDEX, PAC, .Package)' })
  @IsString()
  @IsNotEmpty()
  service!: string;
}

export class LabelRequestDto {
  @ApiProperty({ description: 'WooStock order id' })
  @IsString()
  @IsNotEmpty()
  order_id!: string;

  @ApiProperty({ type: SelectedOptionDto })
  @ValidateNested()
  @Type(() => SelectedOptionDto)
  selected_option!: SelectedOptionDto;
}
