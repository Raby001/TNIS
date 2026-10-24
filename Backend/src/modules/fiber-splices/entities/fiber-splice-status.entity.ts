import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fiber_splice_statuses')
export class FiberSpliceStatus {
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