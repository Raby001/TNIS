import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('cable_core_counts')
export class CableCoreCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'core_count',
    type: 'integer',
    unique: true,
  })
  coreCount: number;

  @Column({
    name: 'display_code',
    type: 'varchar',
    length: 10,
    unique: true,
  })
  displayCode: string;

  @Column({
    name: 'suggested_color_name',
    type: 'varchar',
    length: 50,
  })
  suggestedColorName: string;

  @Column({
    name: 'suggested_hex',
    type: 'varchar',
    length: 7,
  })
  suggestedHex: string;

  @Column({
    name: 'confirm_required',
    type: 'boolean',
    default: false,
  })
  confirmRequired: boolean;

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