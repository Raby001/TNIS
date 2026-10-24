import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FiberCore } from '../../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';
import { Onu } from '../../onus/entities/onu.entity';
import { FiberCoreOnuConnectionStatus } from './fiber-core-onu-connection-status.entity';

@Entity('fiber_core_onu_connections')
export class FiberCoreOnuConnection {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================================
  // Fiber Core
  // ========================================================

  @Column({
    name: 'fiber_core_id',
    type: 'uuid',
  })
  fiberCoreId: string;

  @ManyToOne(
    () => FiberCore,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'fiber_core_id',
  })
  fiberCore: FiberCore;

  // ========================================================
  // Fiber Core Side
  // ========================================================

  @Column({
    name: 'fiber_core_side',
    type: 'enum',
    enum: FiberCoreSide,
  })
  fiberCoreSide: FiberCoreSide;

  // ========================================================
  // ONU
  // ========================================================

  @Column({
    name: 'onu_asset_id',
    type: 'uuid',
  })
  onuAssetId: string;

  @ManyToOne(
    () => Onu,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'onu_asset_id',
  })
  onu: Onu;

  // ========================================================
  // Status
  // ========================================================

  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => FiberCoreOnuConnectionStatus,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'status_id',
  })
  status: FiberCoreOnuConnectionStatus;

  // ========================================================
  // Timestamps
  // ========================================================

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