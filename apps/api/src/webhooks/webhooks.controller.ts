import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { WoocommerceOrderPayloadDto } from './dto/woocommerce-order.dto';
import { WebhooksService } from './webhooks.service';
import { WoocommerceSignatureGuard } from './woocommerce-signature.guard';

@ApiTags('Webhooks')
@Controller('webhooks/woocommerce')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':tenantId')
  @Public()
  @UseGuards(WoocommerceSignatureGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Receive WooCommerce order webhook (created/updated)',
    description:
      'Validates the X-WC-Webhook-Signature against the tenant webhook secret, then upserts the order and logs the event.',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID returned at registration' })
  @ApiResponse({ status: 200, description: 'Webhook accepted' })
  @ApiResponse({ status: 401, description: 'Invalid or missing signature' })
  async receive(
    @Param('tenantId') tenantId: string,
    @Headers('x-wc-webhook-topic') topic: string | undefined,
    @Body() payload: WoocommerceOrderPayloadDto,
  ) {
    await this.webhooksService.handleOrderEvent(tenantId, topic, payload);
    return { received: true };
  }
}
