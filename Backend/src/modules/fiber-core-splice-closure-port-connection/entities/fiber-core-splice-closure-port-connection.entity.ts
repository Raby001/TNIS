import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { FiberCore } from 'src/modules/cables/entities/fiber-core.entity';
import { FiberCoreSide } from 'src/modules/cables/enums/fiber-core-side.enum';
import { SpliceClosurePort } from 'src/modules/splice-closures/entities/splice-closure-port.entity';
import { FiberCoreSpliceClosurePortConnectionStatus } from './fiber-core-splice-closure-port-connection-status.entity';

@Entity('fiber_core_splice_closure_port_connections')
@Unique([
  'fiberCoreId',
  'fiberCoreSide',
  'spliceClosurePortId',
])
export class FiberCoreSpliceClosurePortConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ====================================
  // Fiber Core
  // ====================================

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

  // ====================================
  // Fiber Core Side
  // ====================================

  @Column({
    name: 'fiber_core_side',
    type: 'enum',
    enum: FiberCoreSide,
    enumName: 'fiber_core_side_enum',
  })
  fiberCoreSide: FiberCoreSide;

  // ====================================
  // Splice Closure Port
  // ====================================

  @Column({
    name: 'splice_closure_port_id',
    type: 'uuid',
  })
  spliceClosurePortId: string;

  @ManyToOne(
    () => SpliceClosurePort,
    (port) => port.fiberCoreConnections,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'splice_closure_port_id',
  })
  spliceClosurePort: SpliceClosurePort;

  // ====================================
  // Status
  // ====================================

  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => FiberCoreSpliceClosurePortConnectionStatus,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'status_id',
  })
  status: FiberCoreSpliceClosurePortConnectionStatus;

  // ====================================
  // Timestamps
  // ====================================

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