import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { OccPort } from 'src/modules/fiber-core-occ-port-connection/entities/occ-port.entity';

@Entity('occs')
export class Occ {

  // =======================================================
  // With Asset
  // =======================================================

  @PrimaryColumn('uuid', {
    name: 'asset_id',
  })
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


  @OneToMany(
    () => OccPort,
    (port) => port.occ,
  )
  ports: OccPort[];  

  @Column({
    type: 'int',
    nullable: true,
  })
  portCount: number | null;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
  })  
  usedPortCount: number;


}