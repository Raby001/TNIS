import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/access-control/entities/role.entity';
import { Province } from 'src/modules/locations/entities/province.entity';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  const adminRole = await roleRepository.findOne({
    where: {
      name: 'ADMIN',
    },
  });

  if (!adminRole) {
    throw new Error(
      'ADMIN role not found. Please seed roles before users.',
    );
  }

  const existingAdmin = await userRepository.findOne({
    where: {
      username: 'admin',
    },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin', 10);

  const provinceRepository = dataSource.getRepository(Province);

  const phnomPenh = await provinceRepository.findOne({
    where: {
      code: 'PP',
    }
  })
  
  if(!phnomPenh){
    throw new Error('Phnom Penh province is not Found');
  }

  const adminUser = userRepository.create({
    fullName: 'System Administrator',
    username: 'admin',
    password: hashedPassword,
    isActive: true,
    roleId: adminRole.id,
    provinceId: phnomPenh.id,
  });

  await userRepository.save(adminUser);

  console.log('Admin user created: admin');
}