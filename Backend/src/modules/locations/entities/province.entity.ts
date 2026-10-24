import { Geometry } from "src/common/types/geometry.type";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geometry: Geometry | null;
}