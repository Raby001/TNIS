import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { City } from "./entities/city.entity";
import { Province } from "./entities/province.entity";
import { Site } from "../sites/entities/site.entity";
import { AccessControlModule } from "../access-control/access-control.module";
import { LocationsController } from "./locations.controller";
import { LocationsService } from "./locations.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([City, Province, Site]),
    AccessControlModule,
  ],
  controllers: [
    LocationsController,
  ],

  providers: [
    LocationsService,
  ],

  exports: [
    TypeOrmModule,
    LocationsService,
  ]
})
export class LocationsModule{}