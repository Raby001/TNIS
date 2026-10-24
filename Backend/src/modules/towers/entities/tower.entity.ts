import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';

@Entity('towers')
export class Tower {

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

  @Column({
    name: 'maximum_load',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maximumLoad: number | null;

  @Column({
    name: 'occupied_space',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  occupiedSpace: number | null;

  @Column({
    name: 'available_space',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  availableSpace: number | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  power: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  generator: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  battery: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  gps: boolean;

  @Column({
    name: 'lease_expiry',
    type: 'date',
    nullable: true,
  })
  leaseExpiry: Date | null;
}