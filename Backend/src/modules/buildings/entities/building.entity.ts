import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Site } from 'src/modules/sites/entities/site.entity';
import { Rack } from 'src/modules/racks/entities/rack.entity';

@Entity('buildings')
@Unique(['code'])
export class Building {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  // =============================================
  // With Site
  // =============================================

  @Column({
    name: 'site_id',
    type: 'uuid',
  })
  siteId: string;

  @ManyToOne(
    () => Site,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'site_id',
  })
  site: Site;

  // =============================================
  // With Rack 
  // =============================================

  @OneToMany(
    () => Rack,
    (rack) => rack.building,
  )
  racks: Rack[];

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