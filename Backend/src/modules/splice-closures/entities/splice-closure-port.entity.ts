import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SpliceClosure } from './splice-closure.entity';
import { FiberSplice } from 'src/modules/fiber-splices/entities/fiber-splice.entity';
import { FiberCoreSpliceClosurePortConnection } from 'src/modules/fiber-core-splice-closure-port-connection/entities/fiber-core-splice-closure-port-connection.entity';

@Entity('splice_closure_ports')
@Unique(['spliceClosureId', 'portNumber'])
export class SpliceClosurePort {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // Splice Closure
  // ========================================

  @Column({
    name: 'splice_closure_id',
    type: 'uuid',
  })
  spliceClosureId: string;

  @ManyToOne(
    () => SpliceClosure,
    (spliceClosure) => spliceClosure.ports,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'splice_closure_id',
  })
  spliceClosure: SpliceClosure;

  // ========================================
  // Port Number
  // ========================================

  @Column({
    name: 'port_number',
    type: 'integer',
  })
  portNumber: number;

  // ========================================
  // Fiber Core Connection
  // ========================================

  @OneToMany(
    () => FiberCoreSpliceClosurePortConnection,
    (connection) => connection.spliceClosurePort,
  )
  fiberCoreConnections: FiberCoreSpliceClosurePortConnection[];

  // ========================================
  // Fiber Splice - Side A
  // ========================================

  @OneToMany(
    () => FiberSplice,
    (splice) => splice.spliceClosurePortA,
  )
  splicesAsPortA: FiberSplice[];

  // ========================================
  // Fiber Splice - Side B
  // ========================================

  @OneToMany(
    () => FiberSplice,
    (splice) => splice.spliceClosurePortB,
  )
  splicesAsPortB: FiberSplice[];
}