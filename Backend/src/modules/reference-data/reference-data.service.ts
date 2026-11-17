import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetType } from '../assets/entities/asset-type.entity';
import { CableCoreCount } from '../cables/entities/cable-core-count.entity';
import { CableType } from '../cables/entities/cable-type.entity';
import { FiberCoreStatus } from '../cables/entities/fiber-core-status.entity';
import { FiberSpliceStatus } from '../fiber-splices/entities/fiber-splice-status.entity';
import { InstallationMethod } from '../cables/entities/installation-method.entity';
import { City } from '../locations/entities/city.entity';
import { Province } from '../locations/entities/province.entity';
import { FiberSegmentType } from '../cables/entities/fiber-segment-type.entity';
import { SplitterRatio } from '../optical-splitters/entities/splitter-ratio.entity';
import { FiberCoreSplitterConnectionStatus } from '../fiber-core-splitter-connections/entities/fiber-core-splitter-connection-status.entity';
import { FiberCoreOccPortConnectionStatus } from '../fiber-core-occ-port-connection/entities/fiber-core-occ-port-connection-status.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from '../fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection-status.entity';
import { FiberCoreRouterPortConnectionStatus } from '../fiber-core-router-port-connections/entities/fiber-core-router-port-connection-status.entity';
import { AssetLifecycleStatus } from 'src/modules/assets/entities/asset-lifecycle-status.entity';
import { AssetCondition } from 'src/modules/assets/entities/asset-condition.entity';

@Injectable()
export class ReferenceDataService {

  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,

    @InjectRepository(CableCoreCount)
    private readonly cableCoreCountRepository: Repository<CableCoreCount>,

    @InjectRepository(CableType)
    private readonly cableTypeRepository: Repository<CableType>,

    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,

    @InjectRepository(FiberCoreStatus)
    private readonly fiberCoreStatusRepository: Repository<FiberCoreStatus>,

    @InjectRepository(FiberSpliceStatus)
    private readonly fiberSpliceStatusRepository: Repository<FiberSpliceStatus>,

    @InjectRepository(InstallationMethod)
    private readonly installationMethodRepository: Repository<InstallationMethod>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(FiberSegmentType)
    private readonly FiberSegmentTypeRepository: Repository<FiberSegmentType>,

    @InjectRepository(SplitterRatio)
    private readonly SplitterRationRepository: Repository<SplitterRatio>,
    
    @InjectRepository(FiberCoreSplitterConnectionStatus)
    private readonly FiberCoreSplitterConnectionRepository:Repository<FiberCoreSplitterConnectionStatus>,

    @InjectRepository(FiberCoreOccPortConnectionStatus)
    private readonly FiberCoreOccPortConnectionStatusRepository:Repository<FiberCoreOccPortConnectionStatus>,

    @InjectRepository(FiberCoreSpliceClosurePortConnectionStatus)
    private readonly fiberCoreSpliceClosurePortConnectionStatusRepository: Repository<FiberCoreSpliceClosurePortConnectionStatus>,

    @InjectRepository(FiberCoreRouterPortConnectionStatus)
    private readonly fiberCoreRouterPortConnectionStatusRepository: Repository<FiberCoreRouterPortConnectionStatus>,
  
    @InjectRepository(AssetLifecycleStatus)
    private readonly lifecycleStatusRepository: Repository<AssetLifecycleStatus>,

    @InjectRepository(AssetCondition)
    private readonly assetConditionRepository: Repository<AssetCondition>,  
  ) {}

  // ==========================================
  // Asset Types
  // ==========================================

  async findAssetTypes() {
    return this.assetTypeRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ==========================================
  // Cable Core Counts
  // ==========================================

  async findCableCoreCounts() {
    return this.cableCoreCountRepository.find({
      order: {
        coreCount: 'ASC',
      },
    });
  }

  // ==========================================
  // Cable Types
  // ==========================================

  async findCableTypes() {
    return this.cableTypeRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ==========================================
  // Cities
  // ==========================================

  async findCities() {
    return this.cityRepository.find({
      relations: {
        province: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        province: {
          id: true,
          name: true,
          code: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  // ==========================================
  // Fiber Core Statuses
  // ==========================================

  async findFiberCoreStatuses() {
    return this.fiberCoreStatusRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ==========================================
  // Fiber Splice Statuses
  // ==========================================

  async findFiberSpliceStatuses() {
    return this.fiberSpliceStatusRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ==========================================
  // Installation Methods
  // ==========================================

  async findInstallationMethods() {
    return this.installationMethodRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ==========================================
  // Provinces
  // ==========================================

  async findProvinces() {
    return this.provinceRepository.find({
      select: {
        id: true,
        name: true,
        code: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }


  // ==========================================
  // Fiber Segment type
  // ==========================================

  async findFiberSegmentType() {
    return this.FiberSegmentTypeRepository.find({
      order: {
        sortOrder: 'ASC',
      },
    });
  }

  // ==========================================
  // Splitter Ratio
  // ==========================================
  
  async findSplitterRatios() {
    return this.SplitterRationRepository.find({
      order: {
        ratio: 'ASC',
      },
    });
  }

  // ==========================================
  // Fiber core splitter connection
  // ==========================================
  
  async findFiberCoreSplitterConnectionsStatus() {
    return this.FiberCoreSplitterConnectionRepository.find({
      order: {
        code: 'ASC',
      },
    });
  }

  // ==========================================
  // Fiber core occ splitter connection statuses
  // ==========================================
  
  async findFiberCoreOccPortConnection() {
    return this.FiberCoreOccPortConnectionStatusRepository.find({
      order: {
        code: 'ASC',
      },
    });
  }


  // ==========================================
  // Fiber Core Splice Closure Port Connection Statuses
  // ==========================================

  async findFiberCoreSpliceClosurePortConnection() {
    return this.fiberCoreSpliceClosurePortConnectionStatusRepository.find({
      order: {
        code: 'ASC',
      },
    });
  }  

  // ==========================================
  // Fiber Core Router Port Connection Statuses
  // ==========================================

  async findFiberCoreRouterPortConnection() {
    return this.fiberCoreRouterPortConnectionStatusRepository.find({
      order: {
        code: 'ASC',
      },
    });
  }

  async findAssetLifecycleStatuses() {
    return this.lifecycleStatusRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findAssetConditions() {
    return this.assetConditionRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }


}