import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOccPortConnection } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { SpliceClosurePort } from '../splice-closures/entities/splice-closure-port.entity';
import { FiberCoreSpliceClosurePortConnection } from './entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from './entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnectionsController } from './fiber-core-splice-closure-port-connection.controller';
import { FiberCoreSpliceClosurePortConnectionsService } from './fiber-core-splice-closure-port-connection.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCore,

      FiberCoreStatus,

      FiberCoreSplitterConnection,
      FiberCoreSplitterConnectionStatus,

      FiberCoreOccPortConnection,
      FiberCoreOccPortConnectionStatus,

      SpliceClosurePort,

      FiberCoreSpliceClosurePortConnection,
      FiberCoreSpliceClosurePortConnectionStatus,
    ]),

    AccessControlModule,
  ],

  controllers: [
    FiberCoreSpliceClosurePortConnectionsController,
  ],

  providers: [
    FiberCoreSpliceClosurePortConnectionsService,
  ],

  exports: [
    FiberCoreSpliceClosurePortConnectionsService,
  ],
})
export class FiberCoreSpliceClosurePortConnectionsModule {}