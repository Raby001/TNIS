import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PointGeometryDto } from 'src/common/dto/point-geometry.dto';

export class CreateFieldObservationDto {
  @ApiProperty({
    example: 'Unknown cabinet near Street 271',
  })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Cabinet found during field survey. Asset type is not confirmed yet.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: PointGeometryDto,
    description:'Geographic location of the field observation. Field observations must use a GeoJSON Point.',
    example: {
      type: 'Point',
      coordinates: [104.9282, 11.5564],
    },
  })
  @ValidateNested()
  @Type(() => PointGeometryDto)
  geometry: PointGeometryDto;
}