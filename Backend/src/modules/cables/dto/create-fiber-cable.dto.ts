import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FiberCableConnectionTargetDto } from 'src/modules/fiber-cable-connections/dto/fiber-cable-connection-target.dto';
import { FiberCableInstallationSegmentDto } from './fiber-cable-installation-segment.dto';
import { LineStringGeometryDto } from 'src/common/dto/line-string-geometry.dto';

export class CreateFiberCableDto {
  @ApiProperty({
    example: 'Sihanoukville Fiber Cable 01',
    description: 'Name of the fiber cable asset.',
  })
  @IsString()
  name: string;

  // ==================================================
  // With Asset
  // ==================================================

  @ApiProperty({
    example: 'bb639cb8-2dba-471a-85e8-a3d93d1b47fd',
    description: 'UUID of the Fiber Cable asset type.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiPropertyOptional({
    example: 'Huawei',
    description: 'Manufacturer of the ONU.',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'EG8145V5',
    description: 'Model of the ONU.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    example: 'uuid-of-lifecycle-status',
    description: 'ID of the asset lifecycle status.',
  })
  @IsUUID()
  lifecycleStatusId: string;

  @ApiProperty({
    example: 'uuid-of-condition',
    description: 'ID of the asset condition.',
  })
  @IsUUID()
  conditionId: string;


  // ==================================================
  // With Site
  // ==================================================

  @ApiProperty({
    example: 'site-uuid',
    description: 'UUID of the Site where the fiber cable belongs.',
  })
  @IsUUID()
  siteId: string;

  // ==================================================
  // With Cable
  // ==================================================

  @ApiProperty({
    example: 'G652D',
    description: 'UUID of the cable type.',
  })
  @IsUUID()
  cableTypeId: string;

  // ==================================================
  // With Core Count
  // ==================================================

  @ApiProperty({
    example: '96c-core-count-uuid',
    description: 'UUID of the cable core count.',
  })
  @IsUUID()
  coreCountId: string;

  // ==================================================
  // With Installation Method
  // ==================================================

  @ApiProperty({
    example: 'underground-method-uuid',
    description: 'UUID of the installation method.',
  })
  @IsUUID()
  installationMethodId: string;

  @ApiPropertyOptional({
    type: [FiberCableInstallationSegmentDto],
    description: 'Optional installation-method overrides along the fiber cable route. The default installationMethodId applies everywhere not covered by an override.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FiberCableInstallationSegmentDto)
  installationSegments?: FiberCableInstallationSegmentDto[];

  // ==================================================
  // With SegmentType
  // ==================================================

  @ApiProperty({
    example: 'segment-type-uuid',
    description: 'UUID of the fiber cable segment type: Transport, Distribution, or Access.',
  })
  @IsUUID()
  segmentTypeId: string;

  @ApiPropertyOptional({
    example: 'Main underground fiber route.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // ==================================================
  // Fiber Cable Route
  // ==================================================

  @ApiProperty({
    type: FiberCableConnectionTargetDto,
    description: 'The first connection target of the fiber cable. This must be the START connection.',
  })
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  startTarget: FiberCableConnectionTargetDto;

  @ApiPropertyOptional({
    type: [FiberCableConnectionTargetDto],
    description: 'Intermediate connection targets. Their array order determines their sequence along the fiber cable.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FiberCableConnectionTargetDto)
  middleTargets?: FiberCableConnectionTargetDto[];

  @ApiProperty({
    type: FiberCableConnectionTargetDto,
    description: 'The final connection target of the fiber cable. This must be the END connection.',
  })
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  endTarget: FiberCableConnectionTargetDto;


  // ==================================================
  // General Info
  // ==================================================

  @ApiProperty({
    type: LineStringGeometryDto,
    description: 'Geographic path of the fiber cable. Fiber cables require LineString geometry.',
    example: {
      type: 'LineString',
      coordinates: [
        [103.523, 10.625],
        [103.530, 10.630],
      ],
    },
  })
  @ValidateNested()
  @Type(() => LineStringGeometryDto)
  geometry: LineStringGeometryDto;

  @ApiPropertyOptional({
    example: 'FC-TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'FC-SN-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Date when the fiber cable was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Date when the fiber cable was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Start date of the warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
    description: 'End date of the warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;
  
}