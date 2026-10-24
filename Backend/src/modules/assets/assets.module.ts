import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Asset } from "./entities/asset.entity";
import { AssetType } from "./entities/asset-type.entity";
import { Status } from "./entities/status.entity";
import { AssetsService } from "./assets.service";
import { AssetCodeService } from "./services/asset-code.service";
import { AssetCodeSequece } from "./entities/asset-code-sequence.entity";
import { AssetsController } from "./assets.controller";
import { City } from "../locations/entities/city.entity";
import { Site } from "../sites/entities/site.entity";
import { AccessControlModule } from "../access-control/access-control.module";
import { User } from "../users/entities/user.entity";
import { FiberCableConnection } from "../fiber-cable-connections/entities/fiber-cable-connection.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset, 
      AssetType, 
      Status, 
      AssetCodeSequece, 
      City, 
      Site, 
      User,
      FiberCableConnection,
    ]),
    AccessControlModule
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetCodeService],
  exports: [AssetsService],
})
export class AssetsModule{}