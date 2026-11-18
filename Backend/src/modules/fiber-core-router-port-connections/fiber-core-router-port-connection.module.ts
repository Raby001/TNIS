import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiberCoreRouterPortConnection } from './entities/fiber-core-router-port-connection.entity';
import { FiberCoreRouterPortConnectionStatus } from './entities/fiber-core-router-port-connection-status.entity';
import { RouterPort } from './entities/router-port.entity';
import { FiberCoreRouterPortConnectionController } from './fiber-core-router-port-connection.controller';
import { FiberCoreRouterPortConnectionService } from './fiber-core-router-port-connection.service';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCoreConnectionModule } from '../fiber-core-connection/fiber-core-connection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiberCoreRouterPortConnection,
      FiberCoreRouterPortConnectionStatus,
      RouterPort,
    ]),
    AccessControlModule,
    FiberCoreConnectionModule,
  ],

  controllers: [
    FiberCoreRouterPortConnectionController,
  ],

  providers: [
    FiberCoreRouterPortConnectionService,
  ],

  exports: [
    FiberCoreRouterPortConnectionService,
  ],
})
export class FiberCoreRouterPortConnectionModule {}