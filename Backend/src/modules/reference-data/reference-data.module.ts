import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceDataController } from './reference-data.controller';
import { ReferenceDataService } from './reference-data.service';
import { AssetType } from '../assets/entities/asset-type.entity';
import { CableCoreCount } from '../cables/entities/cable-core-count.entity';
import { CableType } from '../cables/entities/cable-type.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { InstallationMethod } from '../cables/entities/installation-method.entity';
import { City } from '../locations/entities/city.entity';
import { Province } from '../locations/entities/province.entity';
import { Status } from '../assets/entities/status.entity';
import { FiberSegmentType } from '../cables/entities/fiber-segment-type.entity';
import { AccessControlModule } from '../access-control/access-control.module';
import { SplitterRatio } from '../optical-splitters/entities/splitter-ratio.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreRouterPortConnectionStatus } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetType,

      CableCoreCount,
      CableType,
      FiberCoreStatus,
      FiberSpliceStatus,
      InstallationMethod,

      City,
      Province,

      Status,

      SplitterRatio,
      FiberCoreSplitterConnectionStatus,

      FiberSegmentType,

      FiberCoreOccPortConnectionStatus,
      FiberCoreSpliceClosurePortConnectionStatus,
      FiberCoreRouterPortConnectionStatus,
    ]),
    AccessControlModule,
  ],

  controllers: [
    ReferenceDataController,
  ],

  providers: [
    ReferenceDataService,
  ],

  exports: [
    ReferenceDataService,
  ],
})
export class ReferenceDataModule {}