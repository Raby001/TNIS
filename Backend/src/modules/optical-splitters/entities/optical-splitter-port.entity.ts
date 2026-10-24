import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OpticalSplitter } from './optical-splitter.entity';

export enum OpticalSplitterPortType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

@Entity('optical_splitter_ports')
@Unique(['opticalSplitterId', 'portType', 'portNumber'])
export class OpticalSplitterPort {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================================
  // Optical Splitter
  // ========================================================

  @Column({
    name: 'optical_splitter_id',
    type: 'uuid',
  })
  opticalSplitterId: string;

  @ManyToOne(
    () => OpticalSplitter,
    (splitter) => splitter.ports,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'optical_splitter_id',
  })
  opticalSplitter: OpticalSplitter;

  // ========================================================
  // Port Type
  // ========================================================

  @Column({
    name: 'port_type',
    type: 'enum',
    enum: OpticalSplitterPortType,
  })
  portType: OpticalSplitterPortType;

  // ========================================================
  // Port Number
  // ========================================================

  @Column({
    name: 'port_number',
    type: 'int',
  })
  portNumber: number;
}