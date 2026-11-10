import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReferenceDataService } from './reference-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access-control/guards/permissions.guard';
import { Permissions } from '../access-control/decorators/permissions.decorator';

@ApiTags('Reference Data')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reference-data')
export class ReferenceDataController {

  constructor(
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  // ==========================================
  // Asset Types
  // ==========================================

  @Get('asset-types')
   @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get asset types',
    description:'Returns all available asset types for selection.',
  })
  @ApiResponse({
    status: 200,
    description:'Asset types retrieved successfully.',
  })
  findAssetTypes() {
    return this.referenceDataService.findAssetTypes();
  }

  // ==========================================
  // Cable Core Counts
  // ==========================================

  @Get('cable-core-counts')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get cable core counts',
    description:'Returns all available fiber cable core count options.',
  })
  @ApiResponse({
    status: 200,
    description:'Cable core counts retrieved successfully.',
  })
  findCableCoreCounts() {
    return this.referenceDataService.findCableCoreCounts();
  }

  // ==========================================
  // Cable Types
  // ==========================================

  @Get('cable-types')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get cable types',
    description:'Returns all available fiber cable types.',
  })
  @ApiResponse({
    status: 200,
    description:'Cable types retrieved successfully.',
  })
  findCableTypes() {
    return this.referenceDataService.findCableTypes();
  }

  // ==========================================
  // Cities
  // ==========================================

  @Get('cities')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get cities',
    description:'Returns all cities together with their provinces.',
  })
  @ApiResponse({
    status: 200,
    description:'Cities retrieved successfully.',
  })
  findCities() {
    return this.referenceDataService.findCities();
  }

  // ==========================================
  // Fiber Core Statuses
  // ==========================================

  @Get('fiber-core-statuses')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get fiber core statuses',
    description:'Returns all available fiber core statuses.',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber core statuses retrieved successfully.',
  })
  findFiberCoreStatuses() {
    return this.referenceDataService.findFiberCoreStatuses();
  }

  // ==========================================
  // Fiber Splice Statuses
  // ==========================================

  @Get('fiber-splice-statuses')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get fiber splice statuses',
    description:'Returns all available fiber splice statuses.',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber splice statuses retrieved successfully.',
  })
  findFiberSpliceStatuses() {
    return this.referenceDataService.findFiberSpliceStatuses();
  }

  // ==========================================
  // Installation Methods
  // ==========================================

  @Get('installation-methods')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get installation methods',
    description:'Returns all available fiber cable installation methods.',
  })
  @ApiResponse({
    status: 200,
    description:'Installation methods retrieved successfully.',
  })
  findInstallationMethods() {
    return this.referenceDataService.findInstallationMethods();
  }

  // ==========================================
  // Provinces
  // ==========================================

  @Get('provinces')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get provinces',
    description:'Returns all provinces.',
  })
  @ApiResponse({
    status: 200,
    description:'Provinces retrieved successfully.',
  })
  findProvinces() {
    return this.referenceDataService.findProvinces();
  }


  // ==========================================
  // Fiber Segment Types
  // ==========================================


  @Get('fiber-segment-types')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber segment types',
    description:'Returns all available fiber segment types that can be assigned to a fiber cable.',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber segment types retrieved successfully.',
  })
  async findSegmentType() {
    return this.referenceDataService.findFiberSegmentType();
  }
  


  // ==========================================
  // Splitter Ratios
  // ==========================================


  @Get('splitter-ratios')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all splitter ratios',
    description:'Returns all available splitter ratios that can be assigned to an optical splitter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Splitter ratios retrieved successfully.',
  })
  async findSplitterRatios() {
    return this.referenceDataService.findSplitterRatios();
  }


  // ==========================================
  // Fiber Core Splitter Connection Status
  // ==========================================

  @Get('fiber-core-splitter-connection-statuses')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core splitter connection statuses',
    description:'Returns all available statuses for fiber core connections to optical splitters.',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber core splitter connection statuses retrieved successfully.',
  })
  async findFiberCoreSplitterConnectionStatuses() {
    return this.referenceDataService.findFiberCoreSplitterConnectionsStatus();
  }
  

  // ==========================================
  // Fiber Core Occ Connection Status
  // ==========================================

  @Get('fiber-core-occ-port-connection-statuses')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core occ port connection statuses',
    description:'Returns all available status of fiber core occ port connection status',
  })
  @ApiResponse({
    status: 200,
    description:'Fiber core occ port connection statuses retrieved successfully.',
  })
  async findFiberCoreOccPortConnectionStatuses() {
    return this.referenceDataService.findFiberCoreOccPortConnection();
  }

  // ==========================================
  // Fiber Core Splice Closure Port Connection Status
  // ==========================================

  @Get('fiber-core-splice-closure-port-connection-statuses')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core splice closure port connection statuses',
    description: 'Returns all available statuses of fiber core splice closure port connections',
  })
  @ApiResponse({
    status: 200,
    description: 'Fiber core splice closure port connection statuses retrieved successfully.',
  })
  async findFiberCoreSpliceClosurePortConnectionStatuses() {
    return this.referenceDataService.findFiberCoreSpliceClosurePortConnection();
  }

  // ==========================================
  // Fiber Core Router Port Connection Status
  // ==========================================

  @Get('fiber-core-router-port-connection-statuses')
  @Permissions('ASSET_READ')
  @ApiOperation({
    summary: 'Get all fiber core router port connection statuses',
    description:
      'Returns all available statuses of fiber core router port connections',
  })

  @ApiResponse({
    status: 200,
    description:
      'Fiber core router port connection statuses retrieved successfully.',
  })
  async findFiberCoreRouterPortConnectionStatuses() {
    return this.referenceDataService.findFiberCoreRouterPortConnection();
  }

  // ==========================================
  // Asset Lifecycle status
  // ==========================================

  @Get('asset-lifecycle-statuses')
  @ApiOperation({
    summary: 'Get all asset lifecycle statuses',
  })
  async findAssetLifecycleStatuses() {
    return this.referenceDataService.findAssetLifecycleStatuses();
  }

  // ==========================================
  // assest condition status
  // ==========================================

  @Get('asset-conditions')
  @ApiOperation({
    summary: 'Get all asset conditions',
  })
  async findAssetConditions() {
    return this.referenceDataService.findAssetConditions();
  }

}