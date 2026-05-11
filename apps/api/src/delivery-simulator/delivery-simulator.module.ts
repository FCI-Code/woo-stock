import { Module } from '@nestjs/common';
import { DeliverySimulatorService } from './delivery-simulator.service';

@Module({
  providers: [DeliverySimulatorService],
})
export class DeliverySimulatorModule {}
