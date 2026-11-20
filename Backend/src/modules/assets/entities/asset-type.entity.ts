import type { GeometryType } from "src/common/types/geometry.type";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssetCategory } from "./asset-category.entity";
import { AssetTypeCapability } from "./asset-type-capability.entity";
import { AssetTypeContainmentRule } from "./asset-type-containment-rules.entity";

@Entity('asset_types')
export class AssetType {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: '100',
    unique: true,
  })
  name: string;

  // Kept nullable temporarily to support existing records during migration.
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  qualifier: string;

  // Kept nullable temporarily until all existing asset types are categorized.
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => AssetCategory, (category) => category.assetTypes, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: AssetCategory | null;

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

  @Column({ name: 'is_container', type: 'boolean', default: false })
  isContainer: boolean;

  @Column({ name: 'supports_custom_geometry', type: 'boolean', default: true })
  supportsCustomGeometry: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => AssetTypeCapability, (assignment) => assignment.assetType)
  capabilityAssignments: AssetTypeCapability[];

  @OneToMany(
    () => AssetTypeContainmentRule,
    (rule) => rule.parentAssetType,
  )
  parentContainmentRules: AssetTypeContainmentRule[];

  @OneToMany(
    () => AssetTypeContainmentRule,
    (rule) => rule.childAssetType,
  )
  childContainmentRules: AssetTypeContainmentRule[];

}