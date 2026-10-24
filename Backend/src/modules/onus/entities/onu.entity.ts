import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';

@Entity('onus')
@Unique(['assetId'])
export class Onu {
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
    name: 'customer_id',
    type: 'uuid',
  })
  customerId: string;

  @ManyToOne(
    () => Customer,
    (customer) => customer.onus,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'customer_id',
  })
  customer: Customer;

  @Column({
    name: 'mac_address_onu',
    type: 'varchar',
    length: 17,
    nullable: true,
  })
  macAddressONU: string | null;

  @Column({
    name: 'mac_address_router',
    type: 'varchar',
    length: 17,
    nullable: true,
  })
  macAddressRouter: string | null;

  @Column({
    name: 'pon_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  ponType: string | null;

  @Column({
    name: 'download_speed_mbps',
    type: 'numeric',
    nullable: true,
  })
  downloadSpeedMbps: number | null;

  @Column({
    name: 'upload_speed_mbps',
    type: 'numeric',
    nullable: true,
  })
  uploadSpeedMbps: number | null;

  @Column({
    name: 'data_allowance_gb',
    type: 'numeric',
    nullable: true,
  })
  dataAllowanceGb: number | null;

}