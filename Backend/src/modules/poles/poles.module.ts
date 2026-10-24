import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsModule } from 'src/modules/assets/assets.module';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Pole } from './entities/pole.entity';
import { PolesController } from './poles.controller';
import { PolesService } from './poles.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pole,
      Asset,
    ]),
    AccessControlModule,
    AssetsModule,
  ],

  controllers: [
    PolesController,
  ],

  providers: [
    PolesService,
  ],

  exports: [
    PolesService,
  ],
})
export class PolesModule {}