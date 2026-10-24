import type { UserRole, RoleRef } from './user'

export interface UserListItem {
  id: string
  fullName: string
  username: string
  isActive: boolean
  roleId: string
  roleName: UserRole
  provinceId?: string | null
  provinceName?: string | null
  createdAt?: string
}

export interface UserListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CreateUserRequest {
  fullName: string
  username: string
  password: string
  roleId: string
  provinceId?: string | null
}

export interface UpdateUserRequest {
  fullName?: string
  username?: string
  password?: string 
  roleId?: string
  provinceId?: string | null
  isActive?: boolean
}

export type RoleOption = Pick<RoleRef, 'id' | 'name' | 'description'>