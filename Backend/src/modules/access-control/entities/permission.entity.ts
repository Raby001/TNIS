import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  code: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];

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