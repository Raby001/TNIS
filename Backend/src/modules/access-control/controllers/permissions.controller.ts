import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsService } from '../services/permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth('JWT')
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  // ==========================================
  // Get all permissions
  // ==========================================

  @Get()
  @Permissions('ROLE_READ')
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Returns all system-defined permissions that can be assigned to roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully.',
  })
  async findAll() {
    return this.permissionsService.findAll();
  }

  // ==========================================
  // Get permission by ID
  // ==========================================

  @Get(':id')
  @Permissions('ROLE_READ')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Returns a specific system-defined permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission UUID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found.',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.permissionsService.findOne(id);
  }
}