import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Router } from './entities/router.entity';
import { Rack } from '../racks/entities/rack.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AssetType } from '../assets/entities/asset-type.entity';
import { RoutersController } from './routers.controller';
import { RoutersService } from './routers.service';
import { AssetsModule } from '../assets/assets.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Router,
      Rack,
      Asset,
      AssetType,
    ]),
    AssetsModule,
    AccessControlModule,
  ],

  controllers: [
    RoutersController,
  ],

  providers: [
    RoutersService,
  ],

  exports: [
    RoutersService,
  ],
})
export class RoutersModule {}