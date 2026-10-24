import type { GeometryType } from "src/common/types/geometry.type";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssetTopologyMode } from "../enums/asset-topology-mode.enum";

@Entity('asset_types')
export class AssetType {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: '100',
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  qualifier: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'geometry_type',
    type: 'varchar',
    length: 20,
  })
  geometryType: GeometryType;

  @Column({
    name: 'topology_mode',
    type: 'varchar',
    length: 20,
    default: AssetTopologyMode.PHYSICAL,
  })
  topologyMode: AssetTopologyMode;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz'
  })
  updatedAt: Date;

}