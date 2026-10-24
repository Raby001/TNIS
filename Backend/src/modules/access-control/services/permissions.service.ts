import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // ==========================================
  // Get all permissions
  // ==========================================

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        code: 'ASC',
      },
    });
  }

  // ==========================================
  // Get permission by ID
  // ==========================================

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: {
        id,
      },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${id} not found.`,
      );
    }

    return permission;
  }
}