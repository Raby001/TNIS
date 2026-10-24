import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Site } from "./entities/site.entity";
import { SitesService } from "./sites.service";
import { LocationsModule } from "../locations/locations.module";
import { SitesController } from "./sites.controller";
import { HeirarchyModule } from "../hierarchy/heirarchy.module";
import { Asset } from "../assets/entities/asset.entity";
import { AccessControlModule } from "../access-control/access-control.module";


@Module({
  imports: [TypeOrmModule.forFeature(
    [Site, Asset],
  ),
  LocationsModule,
  HeirarchyModule,
  AccessControlModule,
],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule{}