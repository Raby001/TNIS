import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateSpliceClosureDto {
  // ==========================
  // Asset fields
  // ==========================

  @ApiPropertyOptional({
    example: 'Splice Closure SHV-001',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'status-uuid',
    description: 'Asset status ID.',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    example: 'SC-TAG-001',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SC-SN-001',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Splice closure installed along the fiber route.',
  })
  @IsOptional()
  @IsString()
  description?: string;

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

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description: 'Geographic location of the splice closure. Must be Point geometry.',
    example: {
      type: 'Point',
      coordinates: [103.523, 10.625],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;

  // ==========================
  // Splice Closure fields
  // ==========================

  @ApiPropertyOptional({
    example: 'DOME',
  })
  @IsOptional()
  @IsString()
  closureType?: string;

  @ApiPropertyOptional({
    example: 48,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}