import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsModule } from 'src/modules/assets/assets.module';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Handhole } from './entities/handhole.entity';
import { HandholesController } from './handholes.controller';
import { HandholesService } from './handholes.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Handhole,
      Asset,
    ]),
    AccessControlModule,
    AssetsModule,
  ],

  controllers: [
    HandholesController,
  ],

  providers: [
    HandholesService,
  ],

  exports: [
    HandholesService,
  ],
})
export class HandholesModule {}