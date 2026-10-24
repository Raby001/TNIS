import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions: RolePermission[];

  @OneToMany(
    () => User,
    (user) => user.role,
  )
  users: User[];

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