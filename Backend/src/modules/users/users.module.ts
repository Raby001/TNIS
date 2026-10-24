import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Role } from "../access-control/entities/role.entity";
import { Province } from "../locations/entities/province.entity";
import { AccessControlModule } from "../access-control/access-control.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Province]),
    AccessControlModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule{}