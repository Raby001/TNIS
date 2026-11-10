import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateHandholeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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