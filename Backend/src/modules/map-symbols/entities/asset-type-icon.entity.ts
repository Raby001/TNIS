import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetType } from 'src/modules/assets/entities/asset-type.entity';

@Entity('asset_type_icons')
export class AssetTypeIcon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'asset_type_id',
    type: 'uuid',
    unique: true,
  })
  assetTypeId: string;

  @OneToOne(() => AssetType, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'asset_type_id',
  })
  assetType: AssetType;

  @Column({
    name: 'icon_url',
    type: 'text',
  })
  iconUrl: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
  })
  mimeType: string;

  @Column({
    name: 'updated_by_id',
    type: 'uuid',
    nullable: true,
  })
  updatedById: string | null;

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