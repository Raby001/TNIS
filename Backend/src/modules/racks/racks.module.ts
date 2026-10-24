import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rack } from "./entities/rack.entity";
import { Building } from "../buildings/entities/building.entity";
import { RacksController } from "./racks.controller";
import { RacksService } from "./racks.service";
import { Asset } from "../assets/entities/asset.entity";
import { AssetsModule } from "../assets/assets.module";
import { AccessControlModule } from "../access-control/access-control.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rack,
      Building,
      Asset,
    ]),
    AssetsModule,
    AccessControlModule,
  ],
  controllers: [
    RacksController,
  ],
  providers: [
    RacksService,
  ],
  exports: [
    RacksService,
  ],
})
export class RacksModule {}