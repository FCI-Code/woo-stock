import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WoocommerceSignatureGuard } from './woocommerce-signature.guard';

@Module({
  imports: [OrdersModule, ShipmentsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WoocommerceSignatureGuard],
})
export class WebhooksModule {}
