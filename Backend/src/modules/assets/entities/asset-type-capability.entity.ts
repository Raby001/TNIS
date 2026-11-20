import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AssetType } from './asset-type.entity';
import { AssetCapability } from './asset-capability.entity';

@Entity('asset_type_capabilities')
export class AssetTypeCapability {
  @PrimaryColumn({
    name: 'asset_type_id',
    type: 'uuid',
  })
  assetTypeId: string;

  @PrimaryColumn({
    name: 'capability_id',
    type: 'uuid',
  })
  capabilityId: string;

  @ManyToOne(
    () => AssetType,
    (assetType) => assetType.capabilityAssignments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @ManyToOne(
    () => AssetCapability,
    (capability) => capability.typeAssignments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'capability_id' })
  capability: AssetCapability;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
