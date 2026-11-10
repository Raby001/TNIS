import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateLcpDto { 
  // ========================================================
  // Common Asset Information
  // ========================================================

  @ApiPropertyOptional({
    example: 'Sihanoukville LCP 01',
    description: 'Human-readable name of the LCP.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Huawei',
    description: 'Updated manufacturer of the ONU.',
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({
    example: 'EG8145V5',
    description: 'Updated model of the ONU.',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-lifecycle-status',
    description: 'Updated asset lifecycle status.',
  })
  @IsOptional()
  @IsUUID()
  lifecycleStatusId?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-condition',
    description: 'Updated asset condition.',
  })
  @IsOptional()
  @IsUUID()
  conditionId?: string;

  @ApiPropertyOptional({
    example: 'LCP-TAG-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'LCP-SN-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Updated LCP description.',
    description: 'Additional description of the LCP.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // ========================================================
  // Lifecycle
  // ========================================================

  @ApiPropertyOptional({
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  // ========================================================
  // Geometry
  // ========================================================

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description: 'Geographic location of the LCP.',
    example: {
      type: 'Point',
      coordinates: [103.8567, 10.625],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;

  // ========================================================
  // LCP-specific
  // ========================================================

  @ApiPropertyOptional({
    example: 8,
    description: 'Maximum number of optical splitters that the LCP is designed to accommodate.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  splitterCapacity?: number;
}