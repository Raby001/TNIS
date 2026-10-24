import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity';
import { Role } from '../access-control/entities/role.entity';
import { Province } from '../locations/entities/province.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  // ========================================================
  // Find user by name
  // ========================================================

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        username,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        password: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        role: true,
      },
    });
  }

  // ========================================================
  // Find user by id
  // ========================================================

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        role: true,
        province: true,
      },
    });
  }

  // ========================================================
  // Find all user
  // ========================================================


  async findAll(query: UserQueryDto) {
    const {
      search,
      roleId,
      provinceId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.province', 'province');

    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.fullName ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (roleId) {
      queryBuilder.andWhere('user.role_id = :roleId', {
        roleId,
      });
    }

    if (provinceId) {
      queryBuilder.andWhere('user.province_id = :provinceId', {
        provinceId,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.is_active = :isActive', {
        isActive,
      });
    }

    const sortColumnMap = {
      username: 'user.username',
      fullName: 'user.full_name',
      createdAt: 'user.created_at',
      updatedAt: 'user.updated_at',
    } as const;

    queryBuilder.orderBy(
      sortColumnMap[sortBy],
      sortOrder,
    );

    // Stable ordering when two users have the same value.
    queryBuilder.addOrderBy('user.id', 'ASC');

    const skip = (page - 1) * limit;

    queryBuilder
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========================================================
  // Create user
  // ========================================================

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      fullName,
      username,
      password,
      roleId,
      provinceId,
    } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const province = await this.provinceRepository.findOne({
      where: { id: provinceId },
    });

    if (!province) {
      throw new NotFoundException('Province not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      fullName,
      username,
      password: hashedPassword,
      isActive: true,
      roleId,
      provinceId,
    });

    const savedUser = await this.userRepository.save(user);

    return this.findById(savedUser.id) as Promise<User>;
  }

  // ========================================================
  // update user by id
  // ========================================================

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const {
      fullName,
      username,
      password,
      roleId,
      provinceId,
      isActive,
    } = updateUserDto;

    // Check username only if it is being changed.
    if (username && username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username already exists');
      }

      user.username = username;
    }

    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (roleId !== undefined) {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      user.roleId = roleId;
    }

    if (provinceId !== undefined) {
      const province = await this.provinceRepository.findOne({
        where: { id: provinceId },
      });

      if (!province) {
        throw new NotFoundException('Province not found');
      }

      user.provinceId = provinceId;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await this.userRepository.save(user);

    const updatedUser = await this.findById(id);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }


  // ========================================================
  // Delete user by id
  // ========================================================

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;

    await this.userRepository.save(user);
  }  


}