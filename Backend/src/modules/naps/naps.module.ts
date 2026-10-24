import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nap } from './entities/nap.entity';
import { NapsController } from './naps.controller';
import { NapsService } from './naps.service';
import { AssetsModule } from '../assets/assets.module';
import { AccessControlModule } from '../access-control/access-control.module';
import { OpticalSplitter } from '../optical-splitters/entities/optical-splitter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Nap,
      OpticalSplitter,
    ]),
    AssetsModule,
    AccessControlModule,
  ],

  controllers: [
    NapsController,
  ],

  providers: [
    NapsService,
  ],

  exports: [
    NapsService,
  ],
})
export class NapsModule {}