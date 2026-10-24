import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn, Validate, ValidatorConstraint, ValidatorConstraintInterface,} from 'class-validator';
@ValidatorConstraint({ name: 'validLineStringCoordinates', async: false,})
class ValidLineStringCoordinates implements ValidatorConstraintInterface {

  validate(coordinates: unknown): boolean {
    if (!Array.isArray(coordinates)) {
      return false;
    }

    if (coordinates.length < 2) {
      return false;
    }

    return coordinates.every(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        point.every(
          (value) =>
            typeof value === 'number' &&
            Number.isFinite(value),
        ),
    );
  }

  defaultMessage(): string {
    return (
      'LineString coordinates must contain at least 2 points, with each point formatted as [longitude, latitude].'
    );
  }
}

export class LineStringGeometryDto {
  @ApiProperty({
    example: 'LineString',
    enum: ['LineString'],
    description: 'GeoJSON geometry type.',
  })
  @IsIn(['LineString'])
  type: 'LineString';

  @ApiProperty({
    example: [
      [103.523, 10.625],
      [103.530, 10.630],
      [103.540, 10.635],
    ],
    description: 'LineString coordinates in [longitude, latitude] order. At least two points are required.',
    type: [Array],
  })
  @IsArray()
  @ArrayMinSize(2)
  @Validate(ValidLineStringCoordinates)
  coordinates: [number, number][];
}