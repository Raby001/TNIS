import api from './api'
import type { RawApiUser } from '@/types/user'
import type {
  UserListMeta,
  CreateUserRequest,
  UpdateUserRequest,
  RoleOption,
} from '@/types/user-management'

export const userApi = {
  list(params?: { search?: string; roleId?: string; isActive?: boolean; page?: number; limit?: number }) {
    return api.get<{ data: RawApiUser[]; meta: UserListMeta } | RawApiUser[]>('/users', { params })
  },

  getById(id: string) {
    return api.get<RawApiUser>(`/users/${id}`)
  },

  create(data: CreateUserRequest) {
    return api.post<RawApiUser>('/users', data)
  },

  update(id: string, data: UpdateUserRequest) {
    return api.patch<RawApiUser>(`/users/${id}`, data)
  },

  deactivate(id: string) {
    return api.patch<RawApiUser>(`/users/${id}`, { isActive: false })
  },

  getRoles() {
    return api.get<RoleOption[]>('/roles') 
  },
}