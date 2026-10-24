import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Site } from '../sites/entities/site.entity';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Building,
      Site,
    ]),
    AccessControlModule,
  ],

  controllers: [
    BuildingsController,
  ],

  providers: [
    BuildingsService,
  ],

  exports: [
    BuildingsService,
  ],
})
export class BuildingsModule {}