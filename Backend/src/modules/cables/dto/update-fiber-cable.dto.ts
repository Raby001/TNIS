import { IsArray, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FiberCableInstallationSegmentDto } from './fiber-cable-installation-segment.dto';
import { FiberCableConnectionTargetDto } from '../../fiber-cable-connections/dto/fiber-cable-connection-target.dto';
import { LineStringGeometryDto } from 'src/common/dto/line-string-geometry.dto';
import { Type } from 'class-transformer';

export class UpdateFiberCableDto {
  // =============================================
  // Asset Info
  // =============================================

  @ApiPropertyOptional({
    example: 'Phnom Penh - Takeo Fiber Cable',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated description of the fiber cable.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'TAG-FO-001',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-FO-2026-001',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-01',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-01',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-02-01',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiPropertyOptional({
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  // =============================================
  // Fiber Cable
  // =============================================

  @ApiPropertyOptional({
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  cableTypeId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  installationMethodId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Updated fiber cable core count. Existing core IDs are preserved. The count cannot be changed while any existing fiber core has an active topology connection.',
  })
  @IsOptional()
  @IsUUID()
  coreCountId?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Updated fiber segment type ID, such as TRANSPORT, DISTRIBUTION, or ACCESS.',
  })
  @IsOptional()
  @IsUUID()
  segmentTypeId?: string;

  // =============================================
  // Complete / Endpoint Route Update
  // =============================================

  @ApiPropertyOptional({
    type: FiberCableConnectionTargetDto,
    description: 'New START target. If only START or END is supplied, the backend automatically updates the corresponding LineString endpoint.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  startTarget?: FiberCableConnectionTargetDto;

  @ApiPropertyOptional({
    type: [FiberCableConnectionTargetDto],
    description: 'New ordered MIDDLE targets. When supplied, the existing MIDDLE targets are replaced.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FiberCableConnectionTargetDto)
  middleTargets?: FiberCableConnectionTargetDto[];

  @ApiPropertyOptional({
    type: FiberCableConnectionTargetDto,
    description: 'New END target. If only START or END is supplied, the backend automatically updates the corresponding LineString endpoint.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FiberCableConnectionTargetDto)
  endTarget?: FiberCableConnectionTargetDto;

  @ApiPropertyOptional({
    type: LineStringGeometryDto,
    description: 'Complete Fiber Cable LineString. Required when changing the complete route or middle targets.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LineStringGeometryDto)
  geometry?: LineStringGeometryDto;

  // =============================================
  // Installation Segments
  // =============================================

  @ApiPropertyOptional({
    type: [FiberCableInstallationSegmentDto],
    description: 'Replaces all fiber cable installation-method overrides.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FiberCableInstallationSegmentDto)
  installationSegments?: FiberCableInstallationSegmentDto[];
}