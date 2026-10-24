import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateManholeDto {
  @ApiPropertyOptional({
    example: 'Manhole PP 001',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'Updated asset status ID.',
  })
  @IsOptional()
  @IsUUID()
  statusId?: string;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Manhole depth in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depthM?: number;

  @ApiPropertyOptional({
    example: 'Concrete',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'Cast Iron',
  })
  @IsOptional()
  @IsString()
  coverType?: string;

  @ApiPropertyOptional({
    example: 'MH-TAG-001',
  })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({
    example: 'MH-SN-001',
  })
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