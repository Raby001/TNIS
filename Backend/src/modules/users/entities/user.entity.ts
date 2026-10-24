import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,} from 'typeorm';
import { Role } from 'src/modules/access-control/entities/role.entity';
import { Province } from 'src/modules/locations/entities/province.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150, nullable: true })
  fullName: string | null;

  @Column({ unique: true, length: 255 })
  username: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({
    name: 'province_id',
    type: 'uuid',
  })
  provinceId: string;

  @ManyToOne(() => Province, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({name: 'province_id'})
  province: Province;

  @ManyToOne(
    () => Role,
    (role) => role.users,
    { nullable: false, onDelete: 'RESTRICT' },
  )
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}