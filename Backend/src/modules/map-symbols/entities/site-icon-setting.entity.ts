import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_icon_settings')
export class SiteIconSetting {
  @PrimaryColumn({
    name: 'setting_key',
    type: 'varchar',
    length: 30,
    default: 'DEFAULT',
  })
  settingKey: string;

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