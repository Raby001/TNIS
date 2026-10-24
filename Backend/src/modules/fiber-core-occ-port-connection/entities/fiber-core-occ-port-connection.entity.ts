import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FiberCore } from '../../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';
import { OccPort } from './occ-port.entity';
import { FiberCoreOccPortConnectionStatus } from './fiber-core-occ-port-connection-status.entity';

@Entity('fiber_core_occ_port_connections')
export class FiberCoreOccPortConnection {

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
  // OCC Port
  // ========================================================

  @Column({
    name: 'occ_port_id',
    type: 'uuid',
  })
  occPortId: string;

  @ManyToOne(
    () => OccPort,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'occ_port_id',
  })
  occPort: OccPort;

  // ========================================================
  // Status
  // ========================================================

  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => FiberCoreOccPortConnectionStatus,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'status_id',
  })
  status: FiberCoreOccPortConnectionStatus;

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