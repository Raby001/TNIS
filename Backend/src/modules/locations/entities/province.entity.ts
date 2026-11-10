import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MultiPolygonGeometry } from 'src/common/types/geometry.type';
@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  code: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon',
    srid: 4326,
    nullable: true,
  })
  geometry: MultiPolygonGeometry | null;
}