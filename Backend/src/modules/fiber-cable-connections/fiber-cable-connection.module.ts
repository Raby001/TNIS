import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCableConnectionController } from './fiber-cable-connection.controller';
import { FiberCableConnectionService } from './fiber-cable-connection.service';
import { FiberCableConnection } from './entities/fiber-cable-connection.entity';
import { FiberCable } from '../cables/entities/fiber-cable.entity';
import { Asset } from '../assets/entities/asset.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { Site } from '../sites/entities/site.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCableConnection,
      FiberCable,
      Asset,
      Site,
    ]),
    AccessControlModule
  ],

  controllers: [
    FiberCableConnectionController,
  ],

  providers: [
    FiberCableConnectionService,
  ],

  exports: [
    FiberCableConnectionService,
  ],
})
export class FiberCableConnectionModule {}