import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LcpsService } from './lcps.service';
import { CreateLcpDto } from './dto/create-lcp.dto';
import { UpdateLcpDto } from './dto/update-lcp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';
import type { Request } from 'express';
import { User } from '../users/entities/user.entity';


@ApiTags('LCPs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lcps')
export class LcpsController {
  constructor(
    private readonly lcpsService: LcpsService,
  ) {}

  // ========================================================
  // GET ALL
  // ========================================================

  @Get()
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all LCPs',
    description:
      'Returns all LCP assets together with their optical splitters.',
  })
  @ApiResponse({
    status: 200,
    description:
      'LCPs retrieved successfully.',
  })
  findAll() {
    return this.lcpsService.findAll();
  }

  // ========================================================
  // GET ONE
  // ========================================================

  @Get(':assetId')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get an LCP by Asset ID',
    description:
      'Returns an LCP together with its common asset information and optical splitters.',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID of the LCP.',
    example: 'uuid-of-lcp-asset',
  })
  @ApiResponse({
    status: 200,
    description:
      'LCP retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'LCP not found.',
  })
  findOne(
    @Param('assetId') assetId: string,
  ) {
    return this.lcpsService.findOne(assetId);
  }

  // ========================================================
  // POST
  // ========================================================

  @Post()
  @Permissions('ASSET_CREATE')
  @ApiOperation({
    summary: 'Create an LCP',
    description:
      'Creates a common Asset and its corresponding LCP-specific record.',
  })
  @ApiResponse({
    status: 201,
    description:
      'LCP created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid asset type or request data.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Referenced site, status, or asset type not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Duplicate serial number or asset code.',
  })
  create(
    @Body() dto: CreateLcpDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.lcpsService.create(
      dto,
      user.id
    );
  }

  // ========================================================
  // PATCH
  // ========================================================

  @Patch(':assetId')
  @Permissions('ASSET_UPDATE')
  @ApiOperation({
    summary: 'Update an LCP',
    description:
      'Updates both common Asset information and LCP-specific information.',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID of the LCP.',
    example: 'uuid-of-lcp-asset',
  })
  @ApiResponse({
    status: 200,
    description:
      'LCP updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'LCP not found.',
  })
  update(
    @Param('assetId') assetId: string,
    @Body() dto: UpdateLcpDto,
    @Req() req: Request,
  ) {
    const user = req.user as User
    return this.lcpsService.update(
      assetId,
      dto,
      user.id,
    );
  }

  // ========================================================
  // DELETE
  // ========================================================

  @Delete(':assetId')
  @Permissions('ASSET_DELETE')
  @ApiOperation({
    summary: 'Delete an LCP',
    description:
      'Deletes the LCP and its associated common Asset.',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID of the LCP.',
    example: 'uuid-of-lcp-asset',
  })
  @ApiResponse({
    status: 200,
    description:
      'LCP deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'LCP not found.',
  })
  remove(
    @Param('assetId') assetId: string,
  ) {
    return this.lcpsService.remove(assetId);
  }
}