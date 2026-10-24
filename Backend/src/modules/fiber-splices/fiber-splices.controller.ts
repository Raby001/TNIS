import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import { FiberSplicesService } from './fiber-splices.service';
import { FiberSplice } from './entities/fiber-splice.entity';
import { CreateFiberSpliceDto } from './dto/create-fiber-splice.dto';
import { CreateFiberSpliceBulkDto } from './dto/create-fiber-splice-bulk.dto';

@ApiTags('Fiber Splices')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-splices')
export class FiberSplicesController {
  constructor(
    private readonly fiberSplicesService: FiberSplicesService,
  ) {}

  // =========================================================
  // Get All
  // =========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber splices',
    description:'Returns all fiber splices together with their splice closure ports and statuses.',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber splices retrieved successfully.',
  })
  async findAll(): Promise<FiberSplice[]> {
    return this.fiberSplicesService.findAll();
  }

  // =========================================================
  // Get by Splice Closure
  // =========================================================

  @Get('closure/:spliceClosureId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary:'Get fiber splices by splice closure',
    description:'Returns fiber splices whose ports belong to the specified splice closure.',
  })
  @ApiParam({
    name: 'spliceClosureId',
    description:'Splice Closure UUID.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber splices retrieved successfully.',
  })
  async findBySpliceClosure(
    @Param('spliceClosureId', ParseUUIDPipe) spliceClosureId: string,
  ): Promise<FiberSplice[]> {
    return this.fiberSplicesService.findBySpliceClosure(
      spliceClosureId,
    );
  }

  // =========================================================
  // Get One
  // =========================================================

  @Get(':id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get a fiber splice',
  })
  @ApiParam({
    name: 'id',
    description: 'Fiber Splice UUID.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber splice retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber splice not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FiberSplice> {
    return this.fiberSplicesService.findOne(
      id,
    );
  }

  // =========================================================
  // Create
  // =========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a fiber splice',
    description: 'Creates a splice between two splice closure ports.',
  })
  @ApiResponse({
    status: 201,
    description: 'Fiber splice created successfully.',
  })
  async create(
    @Body() dto: CreateFiberSpliceDto,
  ): Promise<FiberSplice> {
    return this.fiberSplicesService.create(
      dto,
    );
  }

  // =========================================================
  // Bulk Create
  // =========================================================

  @Post('bulk')
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create multiple fiber splices',
    description: 'Creates multiple splice closure port-to-port splices in one transaction.',
  })
  @ApiResponse({
    status: 201,
    description: 'Fiber splices created successfully.',
  })
  async createBulk(
    @Body() dto: CreateFiberSpliceBulkDto,
  ): Promise<FiberSplice[]> {
    return this.fiberSplicesService.createBulk(
      dto,
    );
  }

  // =========================================================
  // Disconnect
  // =========================================================

  @Patch(':id/disconnect')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Disconnect a fiber splice',
  })
  @ApiParam({
    name: 'id',
    description:'Fiber Splice UUID.',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber splice disconnected successfully.',
  })
  async disconnect(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FiberSplice> {
    return this.fiberSplicesService.disconnect(
      id,
    );
  }
}