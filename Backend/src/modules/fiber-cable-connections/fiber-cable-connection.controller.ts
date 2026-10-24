import { Body, Controller, Get, Param, Post, UseGuards,} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FiberCableConnectionService } from './fiber-cable-connection.service';
import { CreateFiberCableConnectionDto } from './dto/create-fiber-cable-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('Fiber Cable Connections')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fiber-cable-connections')
export class FiberCableConnectionController {

  constructor(
    private readonly connectionService: FiberCableConnectionService,
  ) {}

  // ==========================================
  // Create
  // ==========================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create a fiber cable connection',
    description: 'Connects a fiber cable to an existing network asset at an endpoint or intermediate splice point.',
  })
  @ApiResponse({
    status: 201,
    description: 'Fiber cable connection created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid connection data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable or asset not found.',
  })
  async create(
    @Body() dto: CreateFiberCableConnectionDto,
  ) {
    return this.connectionService.create(dto);
  }

  // ==========================================
  // Find by Fiber Cable
  // ==========================================

  @Get('fiber-cable/:id')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get connections of a fiber cable',
    description: 'Returns all endpoints and intermediate connection points belonging to a fiber cable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber cable connections retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Fiber cable not found.',
  })
  async findByFiberCable(
    @Param('id') id: string,
  ) {
    return this.connectionService.findByFiberCable(id);
  }
}