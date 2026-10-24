import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';

@Entity('manholes')
export class Manhole {

  // =======================================================
  // With Asset
  // =======================================================

  @PrimaryColumn('uuid', {name: 'asset_id'})
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
    name: 'depth_m',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  depthM: number | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  material: string | null;

  @Column({
    name: 'cover_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  coverType: string | null;

}