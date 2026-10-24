import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hierarchy_code_sequences')
@Index(
  ['parentCode', 'prefix'],
  {
    unique: true,
  },
)
export class HierarchyCodeSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'parent_code',
    type: 'varchar',
    length: 255,
  })
  parentCode: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  prefix: string;

  @Column({
    name: 'last_number',
    type: 'integer',
    default: 0,
  })
  lastNumber: number;
}