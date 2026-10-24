import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { User } from '../../users/entities/user.entity';

export enum FieldObservationStatus {
  OPEN = 'OPEN',
  CONVERTED = 'CONVERTED',
  CANCELLED = 'CANCELLED',
}

@Entity('field_observations')
export class FieldObservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Column({
    type: 'enum',
    enum: FieldObservationStatus,
    default: FieldObservationStatus.OPEN,
  })
  status: FieldObservationStatus;

  @Column({
    name: 'converted_asset_id',
    type: 'uuid',
    nullable: true,
  })
  convertedAssetId: string | null;

  @ManyToOne(() => Asset, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'converted_asset_id' })
  convertedAsset: Asset | null;

  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: false,
  })
  createdById: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  updatedById: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User | null;

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