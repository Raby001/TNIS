import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('asset_conditions')
export class AssetCondition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string | null;
}