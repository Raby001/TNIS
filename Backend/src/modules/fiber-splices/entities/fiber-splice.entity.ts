import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FiberSpliceStatus } from './fiber-splice-status.entity';
import { SpliceClosurePort } from 'src/modules/splice-closures/entities/splice-closure-port.entity';

@Entity('fiber_splices')
export class FiberSplice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ====================================
  // Splice Closure Port A
  // ====================================

  @Column({
    name: 'splice_closure_port_a_id',
    type: 'uuid',
  })
  spliceClosurePortAId: string;

  @ManyToOne(
    () => SpliceClosurePort,
    (port) => port.splicesAsPortA,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'splice_closure_port_a_id',
  })
  spliceClosurePortA: SpliceClosurePort;

  // ====================================
  // Splice Closure Port B
  // ====================================

  @Column({
    name: 'splice_closure_port_b_id',
    type: 'uuid',
  })
  spliceClosurePortBId: string;

  @ManyToOne(
    () => SpliceClosurePort,
    (port) => port.splicesAsPortB,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'splice_closure_port_b_id',
  })
  spliceClosurePortB: SpliceClosurePort;

  // ====================================
  // Fiber Splice Status
  // ====================================

  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => FiberSpliceStatus,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'status_id',
  })
  status: FiberSpliceStatus;

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