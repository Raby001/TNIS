import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fiber_core_splice_closure_port_connection_statuses')
export class FiberCoreSpliceClosurePortConnectionStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  name: string;
}