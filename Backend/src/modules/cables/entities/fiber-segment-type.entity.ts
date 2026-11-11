import { IsOptional } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';

@Entity('fiber_segment_types')
@Unique(['code'])
export class FiberSegmentType {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'sort_order',
    type: 'int',
    nullable: true,
  })
  @IsOptional()
  sortOrder?: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  code: string;

  @Column({
    type: 'varchar',
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