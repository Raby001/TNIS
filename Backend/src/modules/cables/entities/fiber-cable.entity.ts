import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Asset } from 'src/modules/assets/entities/asset.entity';
import { CableType } from './cable-type.entity';
import { CableCoreCount } from './cable-core-count.entity';
import { InstallationMethod } from './installation-method.entity';
import { FiberCore } from './fiber-core.entity';
import { FiberSegmentType } from './fiber-segment-type.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { FiberCableInstallationSegment } from './fiber-cable-installation-segment.entity';

@Entity('fiber_cables')
export class FiberCable {

  // ===================================================
  // With Asset
  // ===================================================

  @PrimaryColumn('uuid', {
    name: 'asset_id',
  })
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

  // ===================================================
  // With Cable
  // ===================================================

  @ManyToOne(
    () => CableType,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'cable_type_id',
  })
  cableType: CableType;

  @Column({
    name: 'cable_type_id',
    type: 'uuid',
  })
  cableTypeId: string;

  // ===================================================
  // With Core Count
  // ===================================================

  @ManyToOne(
    () => CableCoreCount,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'core_count_id',
  })
  coreCount: CableCoreCount;

  @Column({
    name: 'core_count_id',
    type: 'uuid',
  })
  coreCountId: string;

  // ===================================================
  // With cable installtion segment
  // ===================================================
  @OneToMany(
    () => FiberCableInstallationSegment,
    (segment) => segment.fiberCable,
  )
  installationSegments: FiberCableInstallationSegment[];

  // ===================================================
  // With Installation Method
  // ===================================================

  @ManyToOne(
    () => InstallationMethod,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'installation_method_id',
  })
  installationMethod: InstallationMethod;

  @Column({
    name: 'installation_method_id',
    type: 'uuid',
  })
  installationMethodId: string;

  // ===================================================
  // With Cores
  // ===================================================
  @OneToMany(
    () => FiberCore,
    (fiberCore) => fiberCore.fiberCable,
  )
  fiberCores: FiberCore[];

  // ===================================================
  // With Segment Type
  // ===================================================

  @Column({
    name: 'segment_type_id',
    type: 'uuid',
    nullable: false,
  })
  segmentTypeId: string;

  @ManyToOne(
    () => FiberSegmentType,
    {
      nullable: false,
      onDelete: 'RESTRICT'
    }
  )
  @JoinColumn({
    name: 'segment_type_id',
  })
  segmentType: FiberSegmentType;


  // ===================================================
  // General Info
  // ===================================================

  @ApiPropertyOptional({
    example: 2020.5,
    description: 'Actual installed fiber cable length in meters.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  installedLengthM?: number;

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
}