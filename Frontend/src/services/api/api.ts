import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { RefreshTokenRequest, RefreshTokenResponse } from '@/types/user'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './token-storage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.71.53:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
})

const PROACTIVE_REFRESH_LEEWAY_MS = 60_000
const MAX_TIMEOUT_MS = 2_147_483_647

let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null

function decodeTokenExpiration(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded: unknown = JSON.parse(atob(padded))

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('exp' in decoded) ||
      typeof decoded.exp !== 'number' ||
      !Number.isFinite(decoded.exp)
    ) {
      return null
    }

    return decoded.exp * 1000
  } catch {
    return null
  }
}

export function cancelProactiveRefresh() {
  if (proactiveRefreshTimer !== null) {
    clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }
}

export function scheduleProactiveRefresh(accessToken = getAccessToken()) {
  cancelProactiveRefresh()
  if (!accessToken) return

  const expiresAt = decodeTokenExpiration(accessToken)
  if (expiresAt === null) return

  const delay = Math.max(0, expiresAt - Date.now() - PROACTIVE_REFRESH_LEEWAY_MS)

  proactiveRefreshTimer = setTimeout(() => {
    proactiveRefreshTimer = null

    if (delay > MAX_TIMEOUT_MS) {
      scheduleProactiveRefresh()
      return
    }

    void refreshAccessToken()
  }, Math.min(delay, MAX_TIMEOUT_MS))
}

interface RetriableRequest extends InternalAxiosRequestConfig {
  /** Guards against an infinite refresh loop. */
  _retry?: boolean
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function isAuthEndpoint(url: string) {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/forgot-password')
  )
}

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const body: RefreshTokenRequest = { refreshToken }
    const { data } = await api.post<RefreshTokenResponse>('/auth/refresh', body)

    const accessToken = data.accessToken ?? data.access_token
    if (!accessToken) return null

    setAccessToken(accessToken)

    // Some backends rotate the refresh token on every call, others do not.
    // Storing it when present handles both without a second code path.
    const rotated = data.refreshToken ?? data.refresh_token
    if (rotated) setRefreshToken(rotated)

    scheduleProactiveRefresh(accessToken)
    return accessToken
  } catch {
    // Expired, revoked or malformed — treat the session as finished.
    return null
  }
}

let refreshInFlight: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestNewAccessToken().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status
    const original = err.config as RetriableRequest | undefined
    const url = original?.url ?? ''

    if (status === 401 && original && !isAuthEndpoint(url)) {
      // Exactly one retry: a freshly issued token can still be rejected, and
      // trying again would loop forever.
      if (!original._retry) {
        original._retry = true

        const fresh = await refreshAccessToken()

        if (fresh) {
          original.headers.Authorization = `Bearer ${fresh}`
          return api(original)
        }
      }

      // No refresh token, or the refresh itself failed: sign out for real.
      clearTokens()

      // Imported lazily: `router` pulls in this store, so a static import here
      // would create a cycle.
      const { default: router } = await import('@/router')
      if (router.currentRoute.value.path !== '/login') {
        router.push({
          path: '/login',
          // Return the user to where they were, not the dashboard.
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    }

    return Promise.reject(err)
  },
)

export default api