import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CableType } from './entities/cable-type.entity';
import { CableCoreCount } from './entities/cable-core-count.entity';
import { InstallationMethod } from './entities/installation-method.entity';
import { FiberCoreStatus } from './entities/fiber-core-status.entity';
import { FiberCable } from './entities/fiber-cable.entity';
import { FiberCore } from './entities/fiber-core.entity';
import { FiberCablesService } from './fiber-cable.service';
import { FiberCablesController } from './cables.controller';
import { AssetsModule } from '../assets/assets.module';
import { SpliceClosure } from '../splice-closures/entities/splice-closure.entity';
import { FiberSegmentType } from './entities/fiber-segment-type.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { FiberCableConnection } from '../fiber-cable-connections/entities/fiber-cable-connection.entity';
import { FiberCableInstallationSegment } from './entities/fiber-cable-installation-segment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CableType,
      CableCoreCount,
      InstallationMethod,
      FiberCable,
      FiberCore,
      FiberCoreStatus,
      SpliceClosure,
      FiberSegmentType,
      FiberCableConnection,
      FiberCableInstallationSegment,
    ]),
    AssetsModule,
    AccessControlModule,
  ],
  providers: [FiberCablesService,],
  controllers: [FiberCablesController,],
})
export class CablesModule {}