import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Asset } from 'src/modules/assets/entities/asset.entity';

@Entity('poles')
export class Pole {
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

  @Column({
    name: 'height_m',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  heightM: number | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  material: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  owner: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  foundation: string | null;
  
}