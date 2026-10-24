import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('fiber_core_statuses')
export class FiberCoreStatus {
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
    unique: true,
  })
  name: string;

  @Column({
    name: 'color_name',
    type: 'varchar',
    length: 50,
  })
  colorName: string;

  @Column({
    name: 'color_hex',
    type: 'varchar',
    length: 7,
  })
  colorHex: string;

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