import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '../access-control/entities/role.entity';
import { Permission } from '../access-control/entities/permission.entity';
import { RolePermission } from '../access-control/entities/role-permission.entity';
import { User } from '../users/entities/user.entity';

import { AccessControlModule } from '../access-control/access-control.module';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      User,
    ]),
    AccessControlModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}