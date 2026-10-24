import { PointGeometry } from 'src/common/types/geometry.type';
import { City } from 'src/modules/locations/entities/city.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'city_id',
    type: 'uuid',
  })
  cityId: string;

  @ManyToOne(
    () => City,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'city_id',
  })
  city: City;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  elevation: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geometry: PointGeometry | null;
  
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}