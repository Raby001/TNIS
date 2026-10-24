import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn } from 'class-validator';

export class PolygonGeometryDto {
  @ApiProperty({
    example: 'Polygon',
    enum: ['Polygon'],
    description: 'GeoJSON geometry type.',
  })
  @IsIn(['Polygon'])
  type: 'Polygon';

  @ApiProperty({
    example: [
      [
        [103.523, 10.625],
        [103.530, 10.625],
        [103.530, 10.630],
        [103.523, 10.630],
        [103.523, 10.625],
      ],
    ],
    description: 'Polygon coordinates in [longitude, latitude] order. The first and last points should be the same to close the ring.',
    type: [Array],
  })
  @IsArray()
  @ArrayMinSize(1)
  coordinates: [number, number][][];
}