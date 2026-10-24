import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/services/api/user.api'
import { referenceDataApi } from '@/services/api/reference-data.api'
import type { RawApiUser } from '@/types/user'
import type { UserListMeta, CreateUserRequest, UpdateUserRequest, RoleOption } from '@/types/user-management'
import type { ProvinceOption } from '@/types/reference-data'

export const useUserManagementStore = defineStore('userManagement', () => {
  const users = ref<RawApiUser[]>([])
  const meta = ref<UserListMeta | null>(null)
  const roles = ref<RoleOption[]>([])
  const rolesLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const provinces = ref<ProvinceOption[]>([])
  const provincesLoaded = ref(false)
  const activeCount = ref(0)
  const inactiveCount = ref(0)

  async function fetchUsers(params?: { search?: string; roleId?: string; isActive?: boolean; page?: number; limit?: number }) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await userApi.list(params)
      users.value = Array.isArray(data) ? data : data.data ?? []
      meta.value = Array.isArray(data) ? null : data.meta ?? null

      await fetchActivityCounts({
        search: params?.search,
        roleId: params?.roleId,
      })
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load users'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserById(id: string) {
    const { data } = await userApi.getById(id)
    return data
  }

  async function createUser(payload: CreateUserRequest) {
    const { data } = await userApi.create(payload)
    users.value.unshift(data)
    await fetchActivityCounts()
    return data
  }

  function buildUpdatePayload(form: Partial<UpdateUserRequest>): UpdateUserRequest {
    const payload: UpdateUserRequest = {
      fullName: form.fullName,
      username: form.username,
      roleId: form.roleId,
      provinceId: form.provinceId ?? null,
      isActive: form.isActive,
    }
    if (form.password && form.password.trim() !== '') {
      payload.password = form.password
    }
    return payload
  }

  async function fetchActivityCounts(params?: { search?: string; roleId?: string }) {
    const [activeRes, inactiveRes] = await Promise.all([
      userApi.list({
        search: params?.search,
        roleId: params?.roleId,
        isActive: true,
        page: 1,
        limit: 1,
      }),
      userApi.list({
        search: params?.search,
        roleId: params?.roleId,
        isActive: false,
        page: 1,
        limit: 1,
      }),
    ])

    const activeMeta = activeRes && 'data' in activeRes && activeRes.data && typeof activeRes.data === 'object' && 'meta' in activeRes.data
      ? (activeRes.data as any).meta?.total ?? 0
      : Array.isArray(activeRes.data) ? activeRes.data.length : 0

    const inactiveMeta = inactiveRes && 'data' in inactiveRes && inactiveRes.data && typeof inactiveRes.data === 'object' && 'meta' in inactiveRes.data
      ? (inactiveRes.data as any).meta?.total ?? 0
      : Array.isArray(inactiveRes.data) ? inactiveRes.data.length : 0

    activeCount.value = activeMeta
    inactiveCount.value = inactiveMeta
  }

  async function updateUser(id: string, form: Partial<UpdateUserRequest>) {
    const payload = buildUpdatePayload(form)
    const { data } = await userApi.update(id, payload)
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = data
    await fetchActivityCounts()
    return data
  }

  async function deactivateUser(id: string) {
    const { data } = await userApi.deactivate(id)
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = data
    await fetchActivityCounts()
    return data
  }

  async function fetchRoles() {
    if (rolesLoaded.value) return
    const { data } = await userApi.getRoles()
    roles.value = data 
    rolesLoaded.value = true
  }

  async function fetchProvinces() {
    if (provincesLoaded.value) return
    const { data } = await referenceDataApi.getProvinces()
    provinces.value = data 
    provincesLoaded.value = true
  }

  return {
    users, meta, roles, provinces, isLoading, error,
    fetchUsers, fetchUserById, createUser, updateUser, deactivateUser, fetchRoles, fetchProvinces, activeCount, inactiveCount, fetchActivityCounts
  }
})