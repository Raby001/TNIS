import { DataSource } from 'typeorm';
import { Role } from 'src/modules/access-control/entities/role.entity';
import { Permission } from 'src/modules/access-control/entities/permission.entity';
import { RolePermission } from 'src/modules/access-control/entities/role-permission.entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const rolePermissionRepository = dataSource.getRepository(RolePermission);

  // ============================================================
  // ADMIN ROLE
  // ============================================================

  let adminRole = await roleRepository.findOne({
    where: {
      name: 'ADMIN',
    },
  });

  if (!adminRole) {
    adminRole = roleRepository.create({
      name: 'ADMIN',
      description: 'System administrator with full access',
    });

    await roleRepository.save(adminRole);

    console.log('Role created: ADMIN');
  }

  const allPermissions = await permissionRepository.find();

  for (const permission of allPermissions) {
    const existingRolePermission = await rolePermissionRepository.findOne({
        where: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });

    if (existingRolePermission) {
      continue;
    }

    const rolePermission = rolePermissionRepository.create({
      roleId: adminRole.id,
      permissionId: permission.id,
    });

    await rolePermissionRepository.save(rolePermission);

    console.log(
      `Permission ${permission.code} assigned to ADMIN`,
    );
  }

  // ============================================================
  // VIEWER ROLE
  // ============================================================

  let viewerRole = await roleRepository.findOne({
    where: {
      name: 'VIEWER',
    },
  });

  if (!viewerRole) {
    viewerRole = roleRepository.create({
      name: 'VIEWER',
      description: 'Read-only access to network inventory',
    });

    await roleRepository.save(viewerRole);

    console.log('Role created: VIEWER');
  }

  const viewerPermissionCodes = [
    'ASSET_READ',
  ];

  for (const permissionCode of viewerPermissionCodes) {
    const permission = await permissionRepository.findOne({
      where: {
        code: permissionCode,
      },
    });

    if (!permission) {
      console.warn(
        `Permission not found: ${permissionCode}`,
      );
      continue;
    }

    const existingRolePermission =
      await rolePermissionRepository.findOne({
        where: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      });

    if (existingRolePermission) {
      continue;
    }

    const rolePermission = rolePermissionRepository.create({
      roleId: viewerRole.id,
      permissionId: permission.id,
    });

    await rolePermissionRepository.save(rolePermission);

    console.log(
      `Permission ${permission.code} assigned to VIEWER`,
    );
  }
}