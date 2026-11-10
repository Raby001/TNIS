import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateOpticalSplitterDto {
  // ========================================================
  // Asset Information
  // ========================================================

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
    example: 'Splitter PP-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated optical splitter description.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'SPL-PP-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SPL-SN-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  geometry?: PointGeometryDto;

  // ========================================================
  // Optical Splitter Information
  // ========================================================

  @ApiPropertyOptional({
    example: 'lcp-or-nap-asset-uuid',
    description: 'Optional Asset ID of the LCP or NAP containing this optical splitter. Set to null to detach the splitter.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentAssetId?: string | null;

  @ApiPropertyOptional({
    example: 'uuid-of-1-8-ratio',
  })
  @IsOptional()
  @IsUUID()
  splitterRatioId?: string;
}