import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('fiber_core_onu_connection_statuses')
export class FiberCoreOnuConnectionStatus {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 50,
    unique: true,
  })
  code: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

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