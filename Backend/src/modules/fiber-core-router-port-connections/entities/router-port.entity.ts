import { Router } from 'src/modules/routers/entities/router.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('router_ports')
@Unique(['routerAssetId', 'portNumber'])
export class RouterPort {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================================
  // Router
  // ========================================================

  @Column({
    name: 'router_asset_id',
    type: 'uuid',
  })
  routerAssetId: string;

  @ManyToOne(
    () => Router,
    (router) => router.ports,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'router_asset_id',
  })
  router: Router;

  // ========================================================
  // Port Number
  // ========================================================

  @Column({
    name: 'port_number',
    type: 'int',
  })
  portNumber: number;
}