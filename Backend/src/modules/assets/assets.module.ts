import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Asset } from "./entities/asset.entity";
import { AssetType } from "./entities/asset-type.entity";
import { AssetsService } from "./assets.service";
import { AssetCodeService } from "./services/asset-code.service";
import { AssetCodeSequece } from "./entities/asset-code-sequence.entity";
import { AssetsController } from "./assets.controller";
import { City } from "../locations/entities/city.entity";
import { Site } from "../sites/entities/site.entity";
import { AccessControlModule } from "../access-control/access-control.module";
import { User } from "../users/entities/user.entity";
import { FiberCableConnection } from "../fiber-cable-connections/entities/fiber-cable-connection.entity";
import { Province } from "../locations/entities/province.entity";
import { AssetProvinceService } from "./services/asset-province.service";
import { AssetLifecycleStatus } from "./entities/asset-lifecycle-status.entity";
import { AssetCondition } from "./entities/asset-condition.entity";
import { AssetCategory } from "./entities/asset-category.entity";
import { AssetCapability } from "./entities/asset-capability.entity";
import { AssetTypeCapability } from "./entities/asset-type-capability.entity";
import { AssetTypeContainmentRule } from "./entities/asset-type-containment-rules.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset, 
      AssetType, 
      AssetLifecycleStatus,
      AssetCondition,
      AssetCodeSequece, 
      City, 
      Province,
      Site, 
      User,
      FiberCableConnection,
      AssetCategory,
      AssetCapability,
      AssetTypeCapability,
      AssetTypeContainmentRule,
    ]),
    AccessControlModule
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetCodeService, AssetProvinceService],
  exports: [AssetsService],
})
export class AssetsModule{}