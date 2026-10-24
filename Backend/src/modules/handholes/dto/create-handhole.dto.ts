import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateHandholeDto {
  @ApiProperty({
    example: 'Handhole PP 001',
    description: 'Handhole name.',
  })
  @IsString()
  name: string;
  
  @ApiProperty({
    example: 'uuid',
    description: 'Asset type ID for the handhole.',
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
    description: 'Site associated with the handhole.',
  })
  @IsUUID()
  siteId: string;

  @ApiPropertyOptional({
    example: '600x600',
    description: 'Handhole size.',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    example: 'Concrete',
    description: 'Handhole material.',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'Polymer',
    description: 'Handhole cover type.',
  })
  @IsOptional()
  @IsString()
  coverType?: string;

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