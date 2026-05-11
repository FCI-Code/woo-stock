import { Global, Module } from '@nestjs/common';
import { MelhorEnvioService } from './melhor-envio.service';

@Global()
@Module({
  providers: [MelhorEnvioService],
  exports: [MelhorEnvioService],
})
export class MelhorEnvioModule {}
