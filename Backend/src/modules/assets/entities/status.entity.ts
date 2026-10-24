import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('statuses')
export class Status { 
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
    unique: true,
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