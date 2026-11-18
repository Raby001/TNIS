import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCoreOnuConnection } from './entities/fiber-core-onu-connection.entity';
import { FiberCoreOnuConnectionStatus } from './entities/fiber-core-onu-connection-status.entity';
import { FiberCoreOnuConnectionsController } from './fiber-core-onu-connections.controller';
import { FiberCoreOnuConnectionsService } from './fiber-core-onu-connections.service';
import { FiberCore } from '../cables/entities/fiber-core.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCoreConnectionModule } from '../fiber-core-connection/fiber-core-connection.module';
import { Onu } from '../onus/entities/onu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCoreOnuConnection,
      FiberCoreOnuConnectionStatus,

      Onu,
      FiberCore,
    ]),
    AccessControlModule,
    FiberCoreConnectionModule,
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