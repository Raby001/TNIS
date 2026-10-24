import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { FiberCable } from './fiber-cable.entity';
import { InstallationMethod } from './installation-method.entity';
import { FiberCableConnection } from 'src/modules/fiber-cable-connections/entities/fiber-cable-connection.entity';

@Entity('fiber_cable_installation_segments')
@Unique(['fiberCableId', 'fromConnectionId', 'toConnectionId'])
export class FiberCableInstallationSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'fiber_cable_id',
    type: 'uuid',
  })
  fiberCableId: string;

  @ManyToOne(
    () => FiberCable,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'fiber_cable_id',
  })
  fiberCable: FiberCable;

  @Column({
    name: 'from_connection_id',
    type: 'uuid',
  })
  fromConnectionId: string;

  @ManyToOne(
    () => FiberCableConnection,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'from_connection_id',
  })
  fromConnection: FiberCableConnection;

  @Column({
    name: 'to_connection_id',
    type: 'uuid',
  })
  toConnectionId: string;

  @ManyToOne(
    () => FiberCableConnection,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'to_connection_id',
  })
  toConnection: FiberCableConnection;

  @Column({
    name: 'installation_method_id',
    type: 'uuid',
  })
  installationMethodId: string;

  @ManyToOne(
    () => InstallationMethod,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'installation_method_id',
  })
  installationMethod: InstallationMethod;

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