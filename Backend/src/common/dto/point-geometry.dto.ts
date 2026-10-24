import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMaxSize, ArrayMinSize, IsNumber, IsIn } from 'class-validator';

export class PointGeometryDto {
  @ApiProperty({
    example: 'Point',
    enum: ['Point'],
    description: 'GeoJSON geometry type.',
  })
  @IsIn(['Point'])
  type: 'Point';

  @ApiProperty({
    example: [103.523, 10.625],
    description: 'Point coordinates in [longitude, latitude] order.',
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}