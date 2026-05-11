import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ApiKeyGuard } from './api-keys/api-key.guard';
import { EncryptionModule } from './common/encryption/encryption.module';
import { DeliverySimulatorModule } from './delivery-simulator/delivery-simulator.module';
import { MelhorEnvioModule } from './integrations/melhor-envio/melhor-envio.module';
import { WoocommerceModule } from './integrations/woocommerce/woocommerce.module';
import { OrdersModule } from './orders/orders.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ShippingModule } from './shipping/shipping.module';
import { TenantsModule } from './tenants/tenants.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EncryptionModule,
    MelhorEnvioModule,
    WoocommerceModule,
    ApiKeysModule,
    OrdersModule,
    ShipmentsModule,
    ShippingModule,
    TenantsModule,
    WebhooksModule,
    DeliverySimulatorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
