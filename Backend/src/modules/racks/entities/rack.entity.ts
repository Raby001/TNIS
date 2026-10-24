import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

import { Building } from 'src/modules/buildings/entities/building.entity';
import { Router } from 'src/modules/routers/entities/router.entity';
import { Asset } from 'src/modules/assets/entities/asset.entity';

@Entity('racks')
@Unique(['code'])
export class Rack {

  // ========================================================
  // Asset
  // ========================================================

  @PrimaryGeneratedColumn('uuid', {name: 'asset_id'})
  assetId: string;

  @OneToOne(
    () => Asset,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'asset_id',
  })
  asset: Asset;

  // ========================================================
  // Rack information
  // ========================================================

  @Column({
    type: 'varchar',
    length: 250,
  })
  code: string;

  // ========================================================
  // Building
  // ========================================================

  @Column({
    name: 'building_id',
    type: 'uuid',
  })
  buildingId: string;

  @ManyToOne(
    () => Building,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'building_id',
  })
  building: Building;

  // ========================================================
  // Routers
  // ========================================================

  @OneToMany(
    () => Router,
    (router) => router.rack,
  )
  routers: Router[];

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