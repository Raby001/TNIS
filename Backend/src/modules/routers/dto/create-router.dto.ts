import { ApiProperty, ApiPropertyOptional,} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateRouterDto {

  // ========================================================
  // Asset
  // ========================================================

  @ApiProperty({
    example: 'Core Router 01',
    description: 'Name of the router asset.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'router-asset-type-uuid',
    description: 'UUID of the Router asset type.',
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
    description: 'UUID of the Site/POP where the router is located.',
  })
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @ApiPropertyOptional({
    example: 'Core router for Phnom Penh POP.',
    description: 'Additional description of the router.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // ========================================================
  // Optional Geometry
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

  @ApiProperty({
    example: 24,
    description: 'Number of physical ports available on the router.',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  portCount: number;

  // ========================================================
  // Rack
  // ========================================================

  @ApiProperty({
    example: 'rack-uuid',
    description: 'UUID of the rack containing this router.',
  })
  @IsOptional()
  @IsUUID()
  rackId?: string;

  @ApiPropertyOptional({
    example: 'TAG-RCK-001',
    description: 'Physical asset tag or label.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-RCK-001',
    description: 'Manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Date when the rack was purchased.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Date when the rack was installed.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-15',
    description: 'Start date of the rack warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-09-15',
    description: 'End date of the rack warranty.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;
}