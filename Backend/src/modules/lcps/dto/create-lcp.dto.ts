import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min, ValidateNested,} from 'class-validator';
import { Type } from 'class-transformer';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateLcpDto {
  // ========================================================
  // Common Asset Information
  // ========================================================

  @ApiProperty({
    example: 'Sihanoukville LCP 01',
    description: 'Human-readable name of the LCP.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'uuid-of-lcp-asset-type',
    description:
      'Asset Type ID. Must reference the LCP asset type.',
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

  @ApiProperty({
    example: 'site-uuid',
    description:
      'UUID of the Site where the LCP is physically located.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

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
    example: 'LCP installed for FTTH distribution.',
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
    description: 'Date when the LCP was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Date when the LCP was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Start date of the LCP warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
    description: 'End date of the LCP warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  // ========================================================
  // Geometry
  // ========================================================

  @ApiProperty({
    type: PointGeometryDto,
    description: 'Geographic location of the LCP. LCP uses a GeoJSON Point.',
    example: {
      type: 'Point',
      coordinates: [103.8567, 10.625],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;

  // ========================================================
  // LCP-specific
  // ========================================================

  @ApiProperty({
    example: 8,
    description:
      'Maximum number of optical splitters that the LCP is designed to accommodate.',
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  splitterCapacity: number;
}