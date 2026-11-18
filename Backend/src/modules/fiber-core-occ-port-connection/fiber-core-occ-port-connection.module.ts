import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCoreOccPortConnection } from './entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from './entities/fiber-core-occ-port-connection-status.entity';
import { OccPort } from './entities/occ-port.entity';
import { FiberCoreOccPortConnectionController } from './fiber-core-occ-port-connection.controller';
import { FiberCoreOccPortConnectionService } from './fiber-core-occ-port-connection.service';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { Occ } from '../occs/entities/occ.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCoreConnectionModule } from '../fiber-core-connection/fiber-core-connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCoreOccPortConnection,
      FiberCoreOccPortConnectionStatus,
      OccPort,

      FiberCore,

      Occ,
    ]),

    AccessControlModule,
    FiberCoreConnectionModule,
  ],

  controllers: [
    FiberCoreOccPortConnectionController,
  ],

  providers: [
    FiberCoreOccPortConnectionService,
  ],

  exports: [
    FiberCoreOccPortConnectionService,
  ],
})
export class FiberCoreOccPortConnectionModule {}