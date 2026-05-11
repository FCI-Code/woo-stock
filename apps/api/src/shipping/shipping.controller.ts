import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { LabelRequestDto } from './dto/label-request.dto';
import { QuoteRequestDto } from './dto/quote-request.dto';
import { TrackingResponseDto } from './dto/tracking-response.dto';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@ApiSecurity('X-API-Key')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('quote')
  @ApiOperation({
    summary: 'Quote freight options for an order via Melhor Envio',
  })
  @ApiBody({ type: QuoteRequestDto })
  @ApiResponse({ status: 200, description: 'List of available shipping options' })
  @ApiResponse({ status: 400, description: 'Missing origin zip or Melhor Envio token' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  quote(@TenantId() tenantId: string, @Body() dto: QuoteRequestDto) {
    return this.shippingService.quote(tenantId, dto);
  }

  @Post('label')
  @ApiOperation({
    summary: 'Generate shipping label for the chosen quoted option',
  })
  @ApiBody({ type: LabelRequestDto })
  @ApiResponse({ status: 201, description: 'Label generated with tracking code and PDF URL' })
  @ApiResponse({ status: 422, description: 'No prior quote or invalid selected option' })
  generateLabel(@TenantId() tenantId: string, @Body() dto: LabelRequestDto) {
    return this.shippingService.generateLabel(tenantId, dto);
  }

  @Get('tracking/:trackingCode')
  @ApiOperation({ summary: 'Get full shipment tracking by tracking code' })
  @ApiParam({ name: 'trackingCode', description: 'Carrier tracking code (e.g. BR123456789BR)' })
  @ApiResponse({ status: 200, type: TrackingResponseDto, description: 'Tracking data with full timeline' })
  @ApiResponse({ status: 404, description: 'Shipment not found for this tracking code' })
  getTracking(
    @TenantId() tenantId: string,
    @Param('trackingCode') trackingCode: string,
  ): Promise<TrackingResponseDto> {
    return this.shippingService.getTracking(tenantId, trackingCode);
  }
}
