import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { GeometryDto } from 'src/common/dto/geometry.dto';

export class UpdateAssetDto {
  @ApiPropertyOptional({
    example: 'Sihanoukville Tower 01 - Updated',
    description: 'Updated human-readable name of the asset.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'uuid-of-status',
    description: 'New status of the asset.',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    example: 'TAG-002',
    description: 'Updated physical asset tag.',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'SN-987654321',
    description: 'Updated manufacturer serial number.',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    example: 'Updated tower description.',
    description: 'Updated description of the asset.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: GeometryDto,
    description: 'Updated geographic location of the asset.',
    example: {
      type: 'Point',
      coordinates: [103.8567, 13.3619],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;

  @ApiPropertyOptional({
    example: '2026-08-01',
    description: 'Updated purchase date.',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Updated installation date.',
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Updated warranty start date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional({
    example: '2029-08-15',
    description: 'Updated warranty end date.',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

}