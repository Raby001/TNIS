import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LcpsController } from './lcps.controller';
import { LcpsService } from './lcps.service';
import { Lcp } from './entities/lcp.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AssetType } from '../assets/entities/asset-type.entity';
import { OpticalSplitter } from '../optical-splitters/entities/optical-splitter.entity';
import { AssetsModule } from '../assets/assets.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lcp,
      Asset,
      AssetType,
      OpticalSplitter,
    ]),
    AssetsModule,
    AccessControlModule,
  ],

  controllers: [
    LcpsController,
  ],

  providers: [
    LcpsService,
  ],

  exports: [
    LcpsService,
  ],
})
export class LcpsModule {}