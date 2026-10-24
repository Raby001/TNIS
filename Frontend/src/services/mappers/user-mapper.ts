import type { RawApiUser } from '@/types/user'
import type { UserListItem } from '@/types/user-management'

export function mapUserFromApi(raw: RawApiUser): UserListItem {
  return {
    id: raw.id,
    fullName: raw.fullName,
    username: raw.username,
    isActive: raw.isActive,
    roleId: raw.roleId,
    roleName: raw.role?.name ?? 'VIEWER',
    provinceId: raw.provinceId ?? null,
    provinceName: raw.province?.name ?? null,
    createdAt: raw.createdAt,
  }
}