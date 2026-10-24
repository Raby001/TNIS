import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Occ } from '../../occs/entities/occ.entity';

@Entity('occ_ports')
@Unique(['occAssetId', 'portNumber'])
export class OccPort {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================================
  // OCC
  // ========================================================

  @Column({
    name: 'occ_asset_id',
    type: 'uuid',
  })
  occAssetId: string;

  @ManyToOne(
    () => Occ,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'occ_asset_id',
  })
  occ: Occ;

  // ========================================================
  // Port Number
  // ========================================================

  @Column({
    name: 'port_number',
    type: 'int',
  })
  portNumber: number;
}