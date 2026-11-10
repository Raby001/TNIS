import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateRouterDto {

  // ========================================================
  // Asset
  // ========================================================

  @ApiPropertyOptional({
    example: 'Core Router 01',
    description: 'Name of the router asset.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
    example: 'Core router for Phnom Penh POP.',
    description: 'Additional description of the router.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 24,
    description: 'Number of physical ports available on the router.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  portCount?: number;

  // ========================================================
  // Geometry
  // ========================================================

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description:
      'Optional geographic location of the router. Use Point geometry when the physical router location is known.',
    example: {
      type: 'Point',
      coordinates: [104.91725, 11.5624],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;

  // ========================================================
  // Physical Identification
  // ========================================================

  @ApiPropertyOptional({
    example: 'TAG-RTR-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-RTR-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  // ========================================================
  // Lifecycle
  // ========================================================

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Date when the router was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Date when the router was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Start date of the router warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-09-15',
    description: 'End date of the router warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;
}