import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { SpliceClosurePort } from '../splice-closures/entities/splice-closure-port.entity';
import { FiberCoreSpliceClosurePortConnection } from './entities/fiber-core-splice-closure-port-connection.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from './entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnectionsController } from './fiber-core-splice-closure-port-connection.controller';
import { FiberCoreSpliceClosurePortConnectionsService } from './fiber-core-splice-closure-port-connection.service';
import { FiberCoreConnectionModule } from '../fiber-core-connection/fiber-core-connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCore,

      SpliceClosurePort,

      FiberCoreSpliceClosurePortConnection,
      FiberCoreSpliceClosurePortConnectionStatus,
    ]),

    AccessControlModule,
    FiberCoreConnectionModule,
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