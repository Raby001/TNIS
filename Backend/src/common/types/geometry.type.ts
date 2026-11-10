export type PointCoordinates = [number, number];

export type LineStringCoordinates = [number, number][];

export type PolygonCoordinates = [number, number][][];

export type MultiPolygonCoordinates = [number, number][][][];

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

export interface MultiPolygonGeometry {
  type: 'MultiPolygon';
  coordinates: MultiPolygonCoordinates;
}

export type Geometry =
  | PointGeometry
  | LineStringGeometry
  | PolygonGeometry
  | MultiPolygonGeometry;

export type GeometryType = Geometry['type'];