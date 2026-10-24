import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class UpdateFieldObservationDto {
  @ApiPropertyOptional({
    example: 'Possible NAP near Street 271',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'Confirmed as a possible NAP location during field survey.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: PointGeometryDto,
    description: 'Updated geographic location. Field observations must use a GeoJSON Point.',
    example: {
      type: 'Point',
      coordinates: [104.9282, 11.5564],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry?: PointGeometryDto;
}