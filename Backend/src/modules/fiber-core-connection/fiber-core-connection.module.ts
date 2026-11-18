
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';

import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';

import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';

import { FiberCoreOnuConnection } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from '../fiber-core-onu-connections/entities/fiber-core-onu-connection-status.entity';

import { FiberCoreRouterPortConnection } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection.entity';
import { FiberCoreRouterPortConnectionStatus } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection-status.entity';

import { FiberCoreSpliceClosurePortConnection } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';

import { FiberCoreConnectionService } from './fiber-core-connection.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCore,
      FiberCoreStatus,

      FiberCoreOccPortConnection,
      FiberCoreOccPortConnectionStatus,

      FiberCoreSplitterConnection,
      FiberCoreSplitterConnectionStatus,

      FiberCoreOnuConnection,
      FiberCoreOnuConnectionStatus,

      FiberCoreRouterPortConnection,
      FiberCoreRouterPortConnectionStatus,

      FiberCoreSpliceClosurePortConnection,
      FiberCoreSpliceClosurePortConnectionStatus,
    ]),
  ],
  providers: [FiberCoreConnectionService],
  exports: [FiberCoreConnectionService],
})
export class FiberCoreConnectionModule {}
