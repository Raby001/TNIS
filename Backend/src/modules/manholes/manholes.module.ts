import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsModule } from 'src/modules/assets/assets.module';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Manhole } from './entities/manhole.entity';
import { ManholesController } from './manholes.controller';
import { ManholesService } from './manholes.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Manhole,
      Asset,
    ]),
    AccessControlModule,
    AssetsModule,
  ],

  controllers: [
    ManholesController,
  ],

  providers: [
    ManholesService,
  ],

  exports: [
    ManholesService,
  ],
})
export class ManholesModule {}