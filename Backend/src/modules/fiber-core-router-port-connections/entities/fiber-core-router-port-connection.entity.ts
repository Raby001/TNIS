import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FiberCore } from '../../cables/entities/fiber-core.entity';
import { FiberCoreSide } from '../../cables/enums/fiber-core-side.enum';
import { RouterPort } from './router-port.entity';
import { FiberCoreRouterPortConnectionStatus } from './fiber-core-router-port-connection-status.entity';

@Entity('fiber_core_router_port_connections')
export class FiberCoreRouterPortConnection {

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
  // Router Port
  // ========================================================

  @Column({
    name: 'router_port_id',
    type: 'uuid',
  })
  routerPortId: string;

  @ManyToOne(
    () => RouterPort,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'router_port_id',
  })
  routerPort: RouterPort;

  // ========================================================
  // Status
  // ========================================================

  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => FiberCoreRouterPortConnectionStatus,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'status_id',
  })
  status: FiberCoreRouterPortConnectionStatus;

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