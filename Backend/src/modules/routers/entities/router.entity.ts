import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { Rack } from 'src/modules/racks/entities/rack.entity';
import { RouterPort } from 'src/modules/fiber-core-router-port-connections/entities/router-port.entity';

@Entity('routers')
export class Router {

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
  // Router Code
  // ========================================================

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  code: string;

  // ========================================================
  // Rack
  // ========================================================

  @Column({
    name: 'rack_id',
    type: 'uuid',
    nullable: true,
  })
  rackId: string | null;

  @ManyToOne(
    () => Rack,
    {
      nullable: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'rack_id',
  })
  rack: Rack | null;

  // ========================================================
  // Ports
  // ========================================================

  @OneToMany(
    () => RouterPort,
    (port) => port.router,
  )
  ports: RouterPort[];

  // ========================================================
  // Port Count
  // ========================================================

  @Column({
    name: 'port_count',
    type: 'int',
  })
  portCount: number;

  // ========================================================
  // Used Port Count
  // ========================================================

  @Column({
    name: 'used_port_count',
    type: 'int',
    default: 0,
  })
  usedPortCount: number;

}