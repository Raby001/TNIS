import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OpticalSplitter } from './optical-splitter.entity';

@Entity('splitter_ratios')
export class SplitterRatio {
 @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================================
  // Ratio
  // ========================================================

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  ratio: string;

  // ========================================================
  // Input / Output Count
  // ========================================================

  @Column({
    name: 'input_count',
    type: 'int',
  })
  inputCount: number;

  @Column({
    name: 'output_count',
    type: 'int',
  })
  outputCount: number;

  // ========================================================
  // Description
  // ========================================================

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  // ========================================================
  // Timestamps
  // ========================================================

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

  // ========================================================
  // Relations
  // ========================================================

  @OneToMany(
    () => OpticalSplitter,
    (splitter) => splitter.splitterRatio,
  )
  opticalSplitters: OpticalSplitter[];
}