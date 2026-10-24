import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SplitterRatio } from './splitter-ratio.entity';
import { OpticalSplitterPort } from './optical-splitter-port.entity';
import { Asset } from 'src/modules/assets/entities/asset.entity';

@Entity('optical_splitters')
export class OpticalSplitter {

  @PrimaryColumn('uuid', { name: 'asset_id' })
  assetId: string;

  @OneToOne(
    () => Asset,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

 // ========================================================
  // Parent Asset
  // ========================================================
  // This must be an LCP or NAP Asset.

  @Column({
    name: 'parent_asset_id',
    type: 'uuid',
    nullable: true,
  })
  parentAssetId: string | null;

  @ManyToOne(
    () => Asset,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'parent_asset_id',
  })
  parentAsset: Asset | null;

  // ========================================================
  // Splitter Ratio
  // ========================================================

  @Column({
    name: 'splitter_ratio_id',
    type: 'uuid',
  })
  splitterRatioId: string;

  @ManyToOne(
    () => SplitterRatio,
    (splitterRatio) => splitterRatio.opticalSplitters,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'splitter_ratio_id',
  })
  splitterRatio: SplitterRatio;

  // ========================================================
  // Ports
  // ========================================================

  @OneToMany(
    () => OpticalSplitterPort,
    (port) => port.opticalSplitter,
  )
  ports: OpticalSplitterPort[];
}