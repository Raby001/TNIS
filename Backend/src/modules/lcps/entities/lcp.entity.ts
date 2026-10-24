import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { Asset } from '../../assets/entities/asset.entity';

@Entity('lcps')
export class Lcp {
  // ========================================================
  // Primary Key / Asset Reference
  // ========================================================

  @PrimaryColumn('uuid', {
    name: 'asset_id',
  })
  assetId: string;

  @OneToOne(() => Asset, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'asset_id',
  })
  asset: Asset;

  // ========================================================
  // LCP-specific attributes
  // ========================================================

  @Column({
    name: 'splitter_capacity',
    type: 'int',
  })
  splitterCapacity: number;

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
}