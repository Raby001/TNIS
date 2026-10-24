import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreatePoleDto {
  @ApiProperty({
    example: 'Pole PP 001',
    description: 'Pole name.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Asset type ID for the pole.',
  })
  @IsUUID()
  assetTypeId: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Asset status ID.',
  })
  @IsUUID()
  statusId: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Site associated with the pole.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'Pole height in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number;

  @ApiPropertyOptional({
    example: 'Concrete',
    description: 'Pole material.',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'ABC Telecom',
    description: 'Pole owner.',
  })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({
    example: 'Concrete',
    description: 'Pole foundation type.',
  })
  @IsOptional()
  @IsString()
  foundation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warrantyStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiProperty({
    type: PointGeometryDto,
    description: 'Location geometry of the asset.',
    example: {
      type: 'Point',
      coordinates: [104.9173, 11.5624],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;

}