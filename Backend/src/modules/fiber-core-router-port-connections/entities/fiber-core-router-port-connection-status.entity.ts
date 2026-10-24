import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('fiber_core_router_port_connection_statuses')
export class FiberCoreRouterPortConnectionStatus {

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