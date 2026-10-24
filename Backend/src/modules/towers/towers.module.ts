import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tower } from './entities/tower.entity';
import { TowersController } from './towers.controller';
import { TowersService } from './towers.service';
import { AssetsModule } from '../assets/assets.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tower,
    ]),
    AssetsModule,
    AccessControlModule,
  ],

  controllers: [
    TowersController,
  ],

  providers: [
    TowersService,
  ],

  exports: [
    TowersService,
  ],
})
export class TowersModule {}