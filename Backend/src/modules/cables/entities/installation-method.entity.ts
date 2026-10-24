import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('installation_methods')
export class InstallationMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  name: string;

  @Column({
    name: 'line_style',
    type: 'varchar',
    length: 20,
  })
  lineStyle: string;

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