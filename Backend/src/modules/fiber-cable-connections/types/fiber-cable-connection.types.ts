import { FiberCableConnectionRole, FiberCableConnectionTargetType } from '../entities/fiber-cable-connection.entity';
import { PointGeometry } from 'src/common/types/geometry.type';

export type ValidatedFiberCableTarget = {
  connectionRole: FiberCableConnectionRole;
  targetType: FiberCableConnectionTargetType;
  assetId: string | null;
  siteId: string | null;
  geometry: PointGeometry;
};