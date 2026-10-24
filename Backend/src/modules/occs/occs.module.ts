import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'src/modules/access-control/access-control.module';
import { AssetsModule } from 'src/modules/assets/assets.module';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Occ } from './entities/occ.entity';
import { OccsController } from './occs.controller';
import { OccsService } from './occs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Occ,
      Asset,
    ]),
    AssetsModule,
    AccessControlModule,
  ],

  controllers: [
    OccsController,
  ],

  providers: [
    OccsService,
  ],

  exports: [
    OccsService,
  ],
})
export class OccsModule {}