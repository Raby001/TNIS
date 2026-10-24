import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { FiberCable } from './fiber-cable.entity';
import { FiberCoreStatus } from './fiber-core-status.entity';

@Entity('fiber_cores')
@Unique(['fiberCableId', 'coreNumber'])
export class FiberCore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ===================================================
  // With Fiber Cable
  // ===================================================

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

  // ===================================================
  // With Status
  // ===================================================

  @Column({
    name: 'status_id',
    type: 'uuid'
  })
  statusId: string;

  @ManyToOne(
    () => FiberCoreStatus,
    {
      nullable: false,
    }
  )
  @JoinColumn(
    {
      name: 'status_id',
    }
  )
  status: FiberCoreStatus;

  // ===================================================
  // General Info
  // ===================================================

  @Column({
    name: 'core_number',
    type: 'integer',
  })
  coreNumber: number;

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