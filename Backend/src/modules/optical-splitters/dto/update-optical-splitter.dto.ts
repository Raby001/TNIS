import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateOpticalSplitterDto {
  // ========================================================
  // Asset Information
  // ========================================================

  @ApiPropertyOptional({
    example: 'status-uuid',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

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