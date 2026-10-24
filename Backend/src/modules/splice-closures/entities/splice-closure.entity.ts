import { Asset } from "src/modules/assets/entities/asset.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { SpliceClosurePort } from "./splice-closure-port.entity";


@Entity('splice_closures')
export class SpliceClosure {

  // ========================================
  // With Asset
  // ========================================

  @PrimaryColumn('uuid',
    {
      name: 'asset_id'
    }
  )
  assetId: string;


  @OneToOne(
    () => Asset,
    {
      nullable: true,
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({
    name: 'asset_id'
  })
  asset: Asset;

  // ========================================
  // General Info
  // ========================================

  @Column({
    name: 'closure_type',
    type: 'varchar',
    length: 50,
  })
  closureType: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  capacity: number | null;
  
  // ========================================
  // With Splice Closure Port
  // ========================================

  @OneToMany(
    () => SpliceClosurePort,
    (port) => port.spliceClosure,
  )
  ports: SpliceClosurePort[];


}