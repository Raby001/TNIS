import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import type { GeometryType } from 'src/common/types/geometry.type';
@ValidatorConstraint({
  name: 'validGeometryCoordinates',
  async: false,
})

export class ValidGeometryCoordinates implements ValidatorConstraintInterface {
  
  validate(
    coordinates: unknown,
    args: ValidationArguments,
  ): boolean {
    const object = args.object as GeometryDto;

    if (!Array.isArray(coordinates)) {
      return false;
    }

    // ==========================================
    // Point [longitude, latitude]
    // ==========================================

    if (object.type === 'Point') {
      return (
        coordinates.length === 2 &&
        coordinates.every(
          (value) =>
            typeof value === 'number' &&
            Number.isFinite(value),
        )
      );
    }

    // ==========================================
    // LineString [[lng, lat], [lng, lat], ...]
    // ==========================================

    if (object.type === 'LineString') {
      // A LineString needs at least 2 points
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

    // ==========================================
    // Polygon  [[[lng, lat], ...]]
    // ==========================================

    if (object.type === 'Polygon') {
      // Polygon needs at least one ring
      if (coordinates.length < 1) {
        return false;
      }

      return coordinates.every(
        (ring) => {
          if (!Array.isArray(ring)) {
            return false;
          }

          if (ring.length < 4) {
            return false;
          }

          const validPoints = ring.every(
            (point) =>
              Array.isArray(point) &&
              point.length === 2 &&
              point.every(
                (value) =>
                  typeof value === 'number' &&
                  Number.isFinite(value),
              ),
          );

          if (!validPoints) {
            return false;
          }

          const first = ring[0];
          const last = ring[ring.length - 1];

          return (
            first[0] === last[0] &&
            first[1] === last[1]
          );
        },
      );
    }

  // ==========================================
  // MultiPolygon [[[[lng, lat], ...]]]
  // ==========================================

  if (object.type === 'MultiPolygon') {
    if (coordinates.length < 1) {
      return false;
    }

    return coordinates.every(
      (polygon) =>
        Array.isArray(polygon) &&
        polygon.length >= 1 &&
        polygon.every(
          (ring) => {
            if (!Array.isArray(ring) || ring.length < 4) {
              return false;
            }

            const validPoints = ring.every(
              (point) =>
                Array.isArray(point) &&
                point.length === 2 &&
                point.every(
                  (value) =>
                    typeof value === 'number' &&
                    Number.isFinite(value),
                ),
            );

            if (!validPoints) {
              return false;
            }

            const first = ring[0];
            const last = ring[ring.length - 1];

            return (
              first[0] === last[0] &&
              first[1] === last[1]
            );
          },
        ),
    );
  }


    return false;
  }

  defaultMessage(): string {
    return 'Invalid coordinates for the specified geometry type.';
  }
}


export class GeometryDto {
  @ApiProperty({
    example: 'Point',
    enum: ['Point', 'LineString', 'Polygon', 'MultiPolygon'],
    description: 'GeoJSON geometry type.',
  })
  @IsIn(['Point', 'LineString', 'Polygon', 'MultiPolygon'])
  type: GeometryType;

  @ApiProperty({
    description: 'GeoJSON coordinates in [longitude, latitude] order.',
  })
  @IsArray()
  @Validate(ValidGeometryCoordinates)
  coordinates:
    | [number, number]
    | [number, number][]
    | [number, number][][]
    | [number, number][][][];
}