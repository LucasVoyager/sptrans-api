import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpTransHttpClient } from './infra/sptrans-http.client';
import { SpTransService } from './sptrans.service';
import { SpTransController } from './sptrans.controller';

@Module({
  imports: [
    ConfigModule, // herda do import global feito no AppModule
  ],
  providers: [SpTransHttpClient, SpTransService],
  controllers: [SpTransController],
  exports: [SpTransService],
})
export class SpTransModule {}
