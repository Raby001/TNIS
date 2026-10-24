import { Onu } from 'src/modules/onus/entities/onu.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';

@Entity('customers')
@Unique(['customerCode'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'customer_code',
    type: 'varchar',
    length: 100,
  })
  customerCode: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  // ==================================================
  // With Ont
  // ==================================================

  @OneToMany(
    () => Onu,
    (onu) => onu.customer,
  )
  onus: Onu[];

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