import { DataSource } from 'typeorm';
import { Permission } from 'src/modules/access-control/entities/permission.entity';

const permissions = [
  {
    code: 'USER_CREATE',
    description: 'Create users',
  },
  {
    code: 'USER_READ',
    description: 'View users',
  },
  {
    code: 'USER_UPDATE',
    description: 'Update users',
  },
  {
    code: 'USER_DELETE',
    description: 'Delete users',
  },
  {
    code: 'ROLE_CREATE',
    description: 'Create roles',
  },
  {
    code: 'ROLE_READ',
    description: 'View roles',
  },
  {
    code: 'ROLE_UPDATE',
    description: 'Update roles',
  },
  {
    code: 'ROLE_DELETE',
    description: 'Delete roles',
  },

  {
    code: 'ASSET_CREATE',
    description: 'Create assets',
  },
  {
    code: 'ASSET_READ',
    description: 'View assets',
  },
  {
    code: 'ASSET_UPDATE',
    description: 'Update assets',
  },
  {
    code: 'ASSET_DELETE',
    description: 'Delete assets',
  },
];

export async function seedPermissions(dataSource: DataSource) {
  
  const repository = dataSource.getRepository(Permission);

  for (const permissionData of permissions) {
    const existingPermission = await repository.findOne({
      where: {
        code: permissionData.code,
      },
    });

    if (existingPermission) {
      continue;
    }

    const permission = repository.create(permissionData);

    await repository.save(permission);

    console.log(`Permission created: ${permission.code}`);
  }
}