import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GisController } from './gis.controller';
import { GisService } from './gis.service';

import { Asset } from '../assets/entities/asset.entity';
import { Site } from '../sites/entities/site.entity';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      Site,
    ]),
    AccessControlModule,
  ],
  controllers: [
    GisController,
  ],
  providers: [
    GisService,
  ],
  exports: [
    GisService,
  ],
})
export class GisModule {}