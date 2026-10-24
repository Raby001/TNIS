import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateHandholeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  statusId?: string;
  
  @ApiPropertyOptional({
    example: '600x600',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    example: 'Concrete',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'Polymer',
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

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description: 'Updated location geometry of the asset.',
    example: {
      type: 'Point',
      coordinates: [104.9173, 11.5624],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;
}