import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Province } from "./province.entity";

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ===================================================
  // Province
  // ===================================================

  @Column({
    name: 'province_id',
    type: 'uuid',
  })
  provinceId: string;

  @ManyToOne(
    () => Province,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'province_id',
  })
  province: Province;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  code: string;
}