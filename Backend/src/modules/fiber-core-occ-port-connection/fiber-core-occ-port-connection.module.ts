import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCoreOccPortConnection } from './entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from './entities/fiber-core-occ-port-connection-status.entity';
import { OccPort } from './entities/occ-port.entity';
import { FiberCoreOccPortConnectionController } from './fiber-core-occ-port-connection.controller';
import { FiberCoreOccPortConnectionService } from './fiber-core-occ-port-connection.service';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { Occ } from '../occs/entities/occ.entity';
import { FiberSplice } from '../fiber-splices/entities/fiber-splice.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOnuConnection } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCoreOccPortConnection,
      FiberCoreOccPortConnectionStatus,
      OccPort,

      FiberCore,
      FiberCoreStatus,

      Occ,

      FiberSplice,
      FiberSpliceStatus,
      
      FiberCoreSplitterConnection,
      FiberCoreSplitterConnectionStatus,

      FiberCoreOnuConnection,
      FiberCoreOnuConnectionStatus,
    ]),

    AccessControlModule,
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