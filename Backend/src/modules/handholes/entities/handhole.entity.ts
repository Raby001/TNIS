import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';

@Entity('handholes')
export class Handhole {

  // =======================================================
  // With Asset
  // =======================================================

  @PrimaryColumn(
    'uuid', { name: 'asset_id' }
  )
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


  // =======================================================
  // General Info
  // =======================================================

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  size: string | null;

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