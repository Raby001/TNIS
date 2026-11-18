import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCoreSplitterConnection }from './entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus }from './entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreSplitterConnectionsController }from './fiber-core-splitter-connections.controller';
import { FiberCoreSplitterConnectionsService }from './fiber-core-splitter-connections.service';
import { FiberCore }from '../cables/entities/fiber-core.entity';
import { OpticalSplitterPort }from '../optical-splitters/entities/optical-splitter-port.entity';
import { FiberSplice }from '../fiber-splices/entities/fiber-splice.entity';
import { FiberSpliceStatus }from '../fiber-splices/entities/fiber-splice-status.entity';
import { FiberCoreStatus }from '../cables/entities/fiber-core-status.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCoreConnectionModule } from '../fiber-core-connection/fiber-core-connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCoreSplitterConnection,
      FiberCoreSplitterConnectionStatus,

      FiberCore,

      OpticalSplitterPort,

    ]),
    AccessControlModule,
    FiberCoreConnectionModule
  ],

  controllers: [
    FiberCoreSplitterConnectionsController,
  ],

  providers: [
    FiberCoreSplitterConnectionsService,
  ],

  exports: [
    FiberCoreSplitterConnectionsService,
  ],
})
export class FiberCoreSplitterConnectionsModule {}