import { Global, Module } from '@nestjs/common';
import { WoocommerceService } from './woocommerce.service';

@Global()
@Module({
  providers: [WoocommerceService],
  exports: [WoocommerceService],
})
export class WoocommerceModule {}
