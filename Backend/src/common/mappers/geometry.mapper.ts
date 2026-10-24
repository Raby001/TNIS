import { GeometryDto } from '../dto/geometry.dto';
import { Geometry, PointGeometry, LineStringGeometry, PolygonGeometry } from '../types/geometry.type';

export function toGeometry(dto: GeometryDto): Geometry {
  if (dto.type === 'Point') {
    const geometry: PointGeometry = {
      type: 'Point',
      coordinates: dto.coordinates as [number, number],
    };

    return geometry;
  }

  if (dto.type === 'LineString') {
    const geometry: LineStringGeometry = {
      type: 'LineString',
      coordinates: dto.coordinates as [number, number][],
    };

    return geometry;
  }
  
  const geometry: PolygonGeometry = {
    type: 'Polygon',
    coordinates: dto.coordinates as [number, number][][],
  };

  return geometry;
}