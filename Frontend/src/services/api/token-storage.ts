const ACCESS_KEY = 'token'
const REFRESH_KEY = 'refreshToken'

type Store = 'local' | 'session'

let active: Store = 'local'

function storeFor(name: Store): Storage {
  return name === 'local' ? localStorage : sessionStorage
}

function otherOf(name: Store): Store {
  return name === 'local' ? 'session' : 'local'
}

function currentStore(): Store {
  const preferred = storeFor(active)
  if (preferred.getItem(ACCESS_KEY) || preferred.getItem(REFRESH_KEY)) {
    return active
  }

  const fallback = storeFor(otherOf(active))
  if (fallback.getItem(ACCESS_KEY) || fallback.getItem(REFRESH_KEY)) {
    active = otherOf(active)
    return active
  }

  return active
}

export function getAccessToken(): string | null {
  return storeFor(currentStore()).getItem(ACCESS_KEY) ?? null
}

export function getRefreshToken(): string | null {
  return storeFor(currentStore()).getItem(REFRESH_KEY) ?? null
}

export function setTokens(
  accessToken: string,
  refreshToken: string | null,
  remember: boolean,
) {
  active = remember ? 'local' : 'session'
  const target = storeFor(active)
  const other = storeFor(active === 'local' ? 'session' : 'local')

  target.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) target.setItem(REFRESH_KEY, refreshToken)
  else target.removeItem(REFRESH_KEY)

  other.removeItem(ACCESS_KEY)
  other.removeItem(REFRESH_KEY)
}

export function setAccessToken(accessToken: string) {
  storeFor(currentStore()).setItem(ACCESS_KEY, accessToken)
}

export function setRefreshToken(refreshToken: string) {
  storeFor(currentStore()).setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  storeFor('local').removeItem(ACCESS_KEY)
  storeFor('local').removeItem(REFRESH_KEY)
  storeFor('session').removeItem(ACCESS_KEY)
  storeFor('session').removeItem(REFRESH_KEY)
}