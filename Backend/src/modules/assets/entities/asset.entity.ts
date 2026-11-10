import { User } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssetType } from "./asset-type.entity";
import { Status } from "./status.entity";
import { Geometry } from "src/common/types/geometry.type";
import { Site } from "src/modules/sites/entities/site.entity";

@Entity('assets')
export class Asset {

  // ==============================================
  // Asset general information
  // =============================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
    unique: true
  })
  code: string;

  @Column({
    length: 200,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'asset_tag',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  assetTag: string | null;

  @Column({
    name: 'serial_number',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: true,
  })
  serialNumber: string | null;

  // date
  @Column({
    name: 'purchase_date',
    type: 'date',
    nullable: true,
  })
  purchaseDate: Date | null;

  @Column({
    name: 'installation_date',
    type: 'date',
    nullable: true,
  })
  installationDate: Date | null;

  @Column({
    name: 'warrenty_start',
    type: 'date',
    nullable: true,
  })
  warrantyStart: Date | null; 

  @Column({
    name: 'warrenty_end',
    type: 'date',
    nullable: true,
  })
  warrantyEnd: Date | null;

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

  // =========================================================
  // With user
  // =========================================================

  @ManyToOne(
    () => User,
    {
      nullable: true
    }
  )
  @JoinColumn(
    {
      name: 'created_by'
    }
  )
  createdBy: User | null;

  @ManyToOne(
    () => User,
    {
      nullable: true,
    }
  )
  @JoinColumn(
    {
      name: 'updated_by'
    }
  )
  updatedBy: User | null;

  // =========================================================
  // With site
  // =========================================================

  @Column({
    name: 'site_id',
    type: 'uuid',
    nullable: true,
  })
  siteId: string | null;

  @ManyToOne(
    () => Site,
    {
      nullable: true,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'site_id',
  })
  site: Site | null;


  // =========================================================
  // With Asset Type
  // =========================================================


  @Column({
    name: 'asset_type_id',
    type: 'uuid'
  })
  assetTypeId: string;

  @ManyToOne(
    () => AssetType,
    {
      nullable: false,
    },
  )
  @JoinColumn(
    {
      name: 'asset_type_id',
    }
  )
  assetType: AssetType;


  // =========================================================
  // With asset Status
  // =========================================================


  @Column({
    name: 'status_id',
    type: 'uuid',
  })
  statusId: string;

  @ManyToOne(
    () => Status,
    {
      nullable: false,
    }
  )
  @JoinColumn(
    {
      name: 'status_id',
    }
  )
  status: Status;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Geometry',
    srid: 4326,
    nullable: true,
  })
  geometry: Geometry | null;

}