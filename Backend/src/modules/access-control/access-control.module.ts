import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AuthorizationService } from './authorization.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
    ]),
  ],

  controllers: [
    PermissionsController,
  ],

  providers: [
    AuthorizationService,
    PermissionsGuard,
    PermissionsService,
  ],
  exports: [
    AuthorizationService,
    PermissionsGuard,
    TypeOrmModule,
  ],
})
export class AccessControlModule {}