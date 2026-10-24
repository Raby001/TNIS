export type PointCoordinates = [number, number];

export type LineStringCoordinates = [number, number][];

export type PolygonCoordinates = [number, number][][];

export interface PointGeometry {
  type: 'Point';
  coordinates: PointCoordinates;
}

export interface LineStringGeometry {
  type: 'LineString';
  coordinates: LineStringCoordinates;
}

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: PolygonCoordinates;
}

export type Geometry =
  | PointGeometry
  | LineStringGeometry
  | PolygonGeometry;

export type GeometryType = Geometry['type'];