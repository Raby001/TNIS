import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards,} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth('JWT')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  @Permissions('ROLE_CREATE')
  @ApiOperation({
    summary: 'Create a new role',
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully.',
  })
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('ROLE_READ')
  @ApiOperation({
    summary: 'Get all roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully.',
  })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('ROLE_READ')
  @ApiOperation({
    summary: 'Get a role by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found.',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.rolesService.findById(id);
  }

  @Patch(':id')
  @Permissions('ROLE_UPDATE')
  @ApiOperation({
    summary: 'Update a role',
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(
      id,
      updateRoleDto,
    );
  }

  @Delete(':id')
  @Permissions('ROLE_DELETE')
  @ApiOperation({
    summary: 'Delete a role',
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Role cannot be deleted because it is assigned to users.',
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.rolesService.remove(id);

    return {
      message: 'Role deleted successfully',
    };
  }
}