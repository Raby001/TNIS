import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MapSymbolsController } from './map-symbols.controller';
import { MapSymbolsService } from './map-symbols.service';

import { AssetType } from '../assets/entities/asset-type.entity';
import { Site } from '../sites/entities/site.entity';

import { AssetTypeIcon } from './entities/asset-type-icon.entity';
import { SiteIconSetting } from './entities/site-icon-setting.entity';
import { SiteIconOverride } from './entities/site-icon-override.entity';

import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetType,
      Site,
      AssetTypeIcon,
      SiteIconSetting,
      SiteIconOverride,
    ]),

    AccessControlModule,
  ],

  controllers: [
    MapSymbolsController,
  ],

  providers: [
    MapSymbolsService,
  ],

  exports: [
    MapSymbolsService,
  ],
})
export class MapSymbolsModule {}