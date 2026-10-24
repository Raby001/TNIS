import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Role } from '../access-control/entities/role.entity';
import { Permission } from '../access-control/entities/permission.entity';
import { RolePermission } from '../access-control/entities/role-permission.entity';
import { User } from '../users/entities/user.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  // ==================================================
  // Create Role
  // ==================================================

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;

    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(
        `Role "${name}" already exists`,
      );
    }

    // Check that all requested permissions exist
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    }
    );

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException(
        'One or more permissions were not found',
      );
    }

    // Create role and role-permissions in one transaction
    const roleId = await this.dataSource.transaction(
      async (manager) => {
        const role = manager.create(Role, {
          name,
          description: description ?? null,
        });

        const savedRole = await manager.save(Role, role);

        const rolePermissions = permissionIds.map(
          (permissionId) =>
            manager.create(RolePermission, {
              roleId: savedRole.id,
              permissionId,
            }),
        );

        await manager.save(RolePermission, rolePermissions);

        return savedRole.id;
      },
    );

    return this.findById(roleId);
  }


  // ==================================================
  // Find all roles
  // ==================================================

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }


  // ==================================================
  // Find role by id
  // ==================================================


  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException(
        `Role with ID "${id}" not found`,
      );
    }

    return role;
  }

  // ==================================================
  // Update Role
  // ==================================================

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(
        `Role with ID "${id}" not found`,
      );
    }

    const { name, description, permissionIds } = updateRoleDto;

    // Check duplicate role name
    if (name !== undefined && name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name },
      });

      if (existingRole) {
        throw new ConflictException(
          `Role "${name}" already exists`,
        );
      }

      role.name = name;
    }

    if (description !== undefined) {
      role.description = description;
    }

    // If permissionIds was provided, replace the role's permissions
    if (permissionIds !== undefined) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException(
          'One or more permissions were not found',
        );
      }

      await this.dataSource.transaction(
        async (manager) => { 
          await manager.save(Role, role);

          await manager.delete(RolePermission, {
            roleId: id,
          });

          const rolePermissions = permissionIds.map(
            (permissionId) =>
              manager.create(RolePermission, {
                roleId: id,
                permissionId,
              }),
          );

          await manager.save(
            RolePermission,
            rolePermissions,
          );
        },
      );
    } else {
      await this.roleRepository.save(role);
    }

    return this.findById(id);
  }


  // ==================================================
  // Delete role
  // ==================================================


  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(
        `Role with ID "${id}" not found`,
      );
    }

    // Check whether users are still assigned to this role
    const userCount = await this.userRepository.count({
      where: {
        roleId: id,
      },
    });

    if (userCount > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because it is assigned to ${userCount} user(s)`,
      );
    }

    await this.roleRepository.remove(role);
  }
}