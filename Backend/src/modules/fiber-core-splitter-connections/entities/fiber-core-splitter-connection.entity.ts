import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { FiberCore } from '../../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';
import { OpticalSplitterPort } from '../../optical-splitters/entities/optical-splitter-port.entity';
import { FiberCoreSplitterConnectionStatus } from './fiber-core-splitter-connection-status.entity';

@Entity('fiber_core_splitter_connections')
export class FiberCoreSplitterConnection {

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
  // Optical Splitter Port
  // ========================================================

  @Column({
    name: 'optical_splitter_port_id',
    type: 'uuid',
  })
  opticalSplitterPortId: string;

  @ManyToOne(
    () => OpticalSplitterPort,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'optical_splitter_port_id',
  })
  opticalSplitterPort: OpticalSplitterPort;

  // ========================================================
  // Status
  // ========================================================

  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => FiberCoreSplitterConnectionStatus,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'status_id',
  })
  status: FiberCoreSplitterConnectionStatus;

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