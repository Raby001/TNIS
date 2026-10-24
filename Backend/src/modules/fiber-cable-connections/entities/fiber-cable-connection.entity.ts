import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { FiberCable } from '../../cables/entities/fiber-cable.entity';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Site } from 'src/modules/sites/entities/site.entity';

export enum FiberCableConnectionRole {
  START = 'START',
  MIDDLE = 'MIDDLE',
  END = 'END',
}

export enum FiberCableConnectionTargetType {
  ASSET = 'ASSET',
  SITE = 'SITE',
}

@Entity('fiber_cable_connections')
@Unique('UQ_fiber_cable_connection_sequence', [
  'fiberCableId',
  'sequence',
])
export class FiberCableConnection {

  // ==========================================
  // Primary Key
  // ==========================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==========================================
  // Fiber Cable
  // ==========================================

  @Column({
    name: 'fiber_cable_id',
    type: 'uuid',
  })
  fiberCableId: string;

  @ManyToOne(
    () => FiberCable,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'fiber_cable_id',
  })
  fiberCable: FiberCable;

  // ==========================================
  // Connected Asset
  // ==========================================

  @Column({
    name: 'asset_id',
    type: 'uuid',
    nullable: true,
  })
  assetId: string | null;

  @ManyToOne(
    () => Asset,
    {
      nullable: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'asset_id',
  })
  asset: Asset | null;

  // ==========================================
  // Connected Site
  // ==========================================

  @Column({
    name: 'site_id',
    type: 'uuid',
    nullable: true,
  })
  siteId: string | null;

  @ManyToOne(
    () => Site,
    {
      nullable: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'site_id',
  })
  site: Site | null;

  // ==========================================
  // Connection Role & target type
  // ==========================================

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: FiberCableConnectionTargetType,
    nullable: true,
  })
  targetType: FiberCableConnectionTargetType;

  @Column({
    name: 'connection_role',
    type: 'enum',
    enum: FiberCableConnectionRole,
  })
  connectionRole: FiberCableConnectionRole;
  
  // ==========================================
  // Route Sequence
  // ==========================================

  @Column({
    name: 'sequence',
    type: 'integer',
    nullable: true,
  })
  sequence: number | null;


  // ==========================================
  // Timestamps
  // ==========================================

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