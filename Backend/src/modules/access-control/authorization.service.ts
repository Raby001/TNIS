import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../access-control/entities/role-permission.entity';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async getUserPermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: {
        permission: true,
      },
    });

    return rolePermissions.map(
      (rolePermission) => rolePermission.permission.code,
    );
  }

  async hasPermissions(
    roleId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(roleId);
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}