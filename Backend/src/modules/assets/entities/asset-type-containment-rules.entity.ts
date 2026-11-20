
import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { AssetType } from './asset-type.entity';

@Entity('asset_type_containment_rules')
@Unique('UQ_asset_type_containment_parent_child', [
  'parentAssetTypeId',
  'childAssetTypeId',
])
@Check(
  'CHK_asset_type_containment_not_self',
  '"parent_asset_type_id" <> "child_asset_type_id"',
)
export class AssetTypeContainmentRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_asset_type_id', type: 'uuid' })
  parentAssetTypeId: string;

  @ManyToOne(
    () => AssetType,
    (assetType) => assetType.parentContainmentRules,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'parent_asset_type_id' })
  parentAssetType: AssetType;

  @Column({ name: 'child_asset_type_id', type: 'uuid' })
  childAssetTypeId: string;

  @ManyToOne(
    () => AssetType,
    (assetType) => assetType.childContainmentRules,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'child_asset_type_id' })
  childAssetType: AssetType;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
