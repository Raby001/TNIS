import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum AuditAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
}

@Entity({ name: 'audit_logs', schema: 'public', synchronize: false })
export class AuditLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id', nullable: true })
  userId: string | null;

  @Column('text')
  username: string;

  @Column('text')
  action: AuditAction;

  @Column('text', { name: 'entity_type' })
  entityType: string;

  @Column('uuid', { name: 'entity_id' })
  entityId: string;

  @Column('text')
  description: string;

  @Column('jsonb', { name: 'old_values', nullable: true })
  oldValues: Record<string, unknown> | null;

  @Column('jsonb', { name: 'new_values', nullable: true })
  newValues: Record<string, unknown> | null;

  @Column('timestamptz', { name: 'created_at' })
  createdAt: Date;
}
