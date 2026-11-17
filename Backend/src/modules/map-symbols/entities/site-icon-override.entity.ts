import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from 'src/modules/sites/entities/site.entity';

@Entity('site_icon_overrides')
export class SiteIconOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'site_id',
    type: 'uuid',
    unique: true,
  })
  siteId: string;

  @OneToOne(() => Site, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'site_id',
  })
  site: Site;

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