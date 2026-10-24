import { MapQueryDto } from "../dto/map-query.dto";

// Use to make sure that every asset provide that need to display on map need to implement these 2 functions
export interface MapFeatureProvider {
  getType(): string;
  getFeatures(
    query: MapQueryDto,
  ): Promise<any[]>
}