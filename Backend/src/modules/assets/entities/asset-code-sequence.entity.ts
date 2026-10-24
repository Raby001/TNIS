import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { AssetType } from "./asset-type.entity";

@Entity('asset_code_sequences')
@Unique(['assetType', 'regionCode'])
export class AssetCodeSequece {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => AssetType,
    {
      nullable: false,
    }
  )
  @JoinColumn({
    name: 'asset_type_id'
  })
  assetType: AssetType

  @Column({
    name: 'region_code',
    length: 4,
  })
  regionCode: string;

  @Column({
    name: 'last_sequence',
    type: 'int',
    default: 0,
  })
  lastSequence: number;

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