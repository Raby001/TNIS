import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCoreOnuConnection } from './entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from './entities/fiber-core-onu-connection-status.entity';
import { FiberCoreOnuConnectionsController } from './fiber-core-onu-connections.controller';
import { FiberCoreOnuConnectionsService } from './fiber-core-onu-connections.service';
import { Onu } from '../onus/entities/onu.entity';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { FiberSplice } from '../fiber-splices/entities/fiber-splice.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { FiberCoreSplitterConnection } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCoreOnuConnection,
      FiberCoreOnuConnectionStatus,

      Onu,
      FiberCore,

      FiberSplice,
      FiberSpliceStatus,

      FiberCoreSplitterConnection,
      FiberCoreSplitterConnectionStatus,

      FiberCoreStatus,
    ]),
    AccessControlModule,
  ],

  controllers: [
    FiberCoreOnuConnectionsController,
  ],

  providers: [
    FiberCoreOnuConnectionsService,
  ],

  exports: [
    TypeOrmModule,
  ],
})
export class FiberCoreOnuConnectionsModule {}