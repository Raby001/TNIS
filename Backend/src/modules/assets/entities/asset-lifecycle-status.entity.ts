import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('asset_lifecycle_statuses')
export class AssetLifecycleStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string | null;
}