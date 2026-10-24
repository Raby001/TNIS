import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, {
  cancelProactiveRefresh,
  scheduleProactiveRefresh,
} from '../services/api/api'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../services/api/token-storage'
import type {
  User,
  UserRole,
  PermissionCode,
  AuthUserResponse,
  LoginResponse,
  UpdateMeRequest,
  ChangePasswordRequest
} from '@/types/user'

function extractPermissions(raw: AuthUserResponse | any): PermissionCode[] {
  const list = raw?.role?.rolePermissions
  if (!Array.isArray(list)) return []
  return list
    .map((rp: any) => rp?.permission?.code)
    .filter(Boolean) as PermissionCode[]
}

function normalizeUser(raw: AuthUserResponse | any): User {
  return {
    id: raw.id,
    fullName: raw.fullName ?? raw.name ?? raw.username ?? 'User',
    username: raw.username ?? '',
    isActive: raw.isActive ?? true,
    roleId: raw.roleId ?? raw.role?.id ?? '',
    roleName: (raw.role?.name ?? 'VIEWER') as UserRole,
    provinceId: raw.provinceId ?? raw.province?.id,
    provinceName: raw.province?.name,
    permissions: extractPermissions(raw),
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getAccessToken())

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const roleName = computed(() => user.value?.roleName ?? null)

  function hasRole(...roles: UserRole[]) {
    if (!user.value) return false
    return roles.includes(user.value.roleName)
  }

  function isAdmin() {
    return user.value?.roleName === 'ADMIN'
  }

  function can(...codes: PermissionCode[]) {
    if (!user.value) return false
    if (user.value.roleName === 'ADMIN') return true
    return codes.some((c) => user.value!.permissions.includes(c))
  }

  function canAll(...codes: PermissionCode[]) {
    if (!user.value) return false
    return codes.every((c) => user.value!.permissions.includes(c))
  }

  async function signIn(username: string, password: string, keepSignedIn = true) {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    })

    const accessToken = data.accessToken ?? data.access_token
    const refreshToken = data.refreshToken ?? data.refresh_token ?? null
    if (!accessToken) throw new Error('No access token returned from server')

    token.value = accessToken
    setTokens(accessToken, refreshToken, keepSignedIn)
    scheduleProactiveRefresh(accessToken)

    if (data.user) {
      user.value = normalizeUser(data.user)
    } else {
      await restoreSession()
    }

    if (!user.value) {
      throw new Error('Login succeeded but user profile is missing')
    }

    return user.value
  }

  async function restoreSession() {
    const saved = getAccessToken()
    if (!saved) return

    token.value = saved
    scheduleProactiveRefresh(saved)

    try {
      const { data } = await api.get('/auth/me')
      user.value = normalizeUser(data.user ?? data)
    } catch {
      signOut()
    }
  }

  function signOut() {
    cancelProactiveRefresh()
    user.value = null
    token.value = null
    clearTokens()
  }

  async function logout() {
    const refreshToken = getRefreshToken()
    const accessToken = getAccessToken()

    signOut()

    if (!refreshToken) return

    try {
      await api.post(
        '/auth/logout',
        { refreshToken },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        },
      )
    } catch {
      // The endpoint may be unreachable or the token already expired. The
      // session is gone locally either way, which is what actually matters.
    }
  }

  async function updateProfile(data: UpdateMeRequest) {
    const { data: updated } = await api.patch('/auth/me', data)
    user.value = normalizeUser(updated.user ?? updated)
    return user.value
  }

  async function changePassword(payload: ChangePasswordRequest) {
    await api.patch('/auth/me/password', payload)
  }

  return {
    user,
    token,
    isAuthenticated,
    roleName,
    hasRole,
    isAdmin,
    can,
    canAll,
    signIn,
    signOut,
    logout,
    restoreSession,
    updateProfile,
    changePassword
  }
})