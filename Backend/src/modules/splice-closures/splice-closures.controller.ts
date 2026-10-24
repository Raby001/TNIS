import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UpdateSpliceClosureDto } from './dto/update-splice-closure.dto';
import { SpliceClosuresService } from './splice-closures.service';
import { CreateSpliceClosureDto } from './dto/create-splice-closure.dto';
import { SpliceClosure } from './entities/splice-closure.entity';
import { FiberSplicesService } from '../fiber-splices/fiber-splices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Splice Closures')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('splice-closures')
export class SpliceClosuresController {
  constructor(
    private readonly spliceClosuresService: SpliceClosuresService,
    private readonly fiberSplicesService: FiberSplicesService,
  ) {}

  // ========================================
  // ============== Get
  // ========================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all splice closures',
    description: 'Returns all splice closures together with their asset information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Splice closures retrieved successfully.',
  })
  async findAll(): Promise<SpliceClosure[]> {
    return this.spliceClosuresService.findAll();
  }

  @Get(':id/splices')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get fiber splices in a splice closure',
    description: 'Returns all fiber splice connections belonging to a splice closure.',
  })
  @ApiParam({
    name: 'id',
    description: 'Splice closure ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber splices retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Splice closure not found.',
  })
  async findSplices(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fiberSplicesService.findBySpliceClosure(id);
  }

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a splice closure',
  })
  @ApiParam({
    name: 'id',
    description: 'Splice closure ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Splice closure retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Splice closure not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.spliceClosuresService.findOne(id);
  }

  // ========================================
  // ============== Create
  // ========================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a splice closure',
    description: 'Creates a splice closure together with its Asset record.',
  })
  @ApiResponse({
    status: 201,
    description: 'Splice closure created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid geometry or request data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Asset type, status, site, or user not found.',
  })
  async create(
    @Body() dto: CreateSpliceClosureDto,
    @Req() request: Request,
  ): Promise<SpliceClosure> {
    const user = request.user as User;

    return this.spliceClosuresService.create(dto, user.id);
  }

  // ========================================
  // ============== Update
  // ========================================

  @Patch(':id')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update a splice closure',
  })
  @ApiParam({
    name: 'id',
    description: 'Splice closure ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Splice closure updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Splice closure not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpliceClosureDto,
    @Req() request: Request,
  ) {
    const user = request.user as User;

    return this.spliceClosuresService.update(
      id,
      dto,
      user.id,
    );
  }

  // ========================================
  // ============== Delete
  // ========================================

  @Delete(':id')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete a splice closure',
    description: 'Deletes the splice closure and its associated Asset record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Splice closure ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Splice closure deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Splice closure not found.',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{message: string}> {
    return this.spliceClosuresService.remove(id);
  }
}