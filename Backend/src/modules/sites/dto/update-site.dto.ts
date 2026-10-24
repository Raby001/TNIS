import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateSiteDto {
  @ApiPropertyOptional({
    example: 'Takhmao Main Site',
    description: 'Updated name of the site.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Takhmao, Kandal Province, Cambodia',
    description: 'Updated physical address of the site.',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 18.5,
    description: 'Updated elevation above sea level in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  elevation?: number;

  @ApiPropertyOptional({
    example: 'Updated site description.',
    description: 'Updated additional information about the site.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description: 'Updated geographic location. Site must use Point geometry.',
    example: {
      type: 'Point',
      coordinates: [104.772, 11.483],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;
}