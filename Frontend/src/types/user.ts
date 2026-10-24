export interface User {
  id: string
  fullName: string
  username: string
  isActive: boolean
  roleId: string
  roleName: UserRole
  provinceId?: string
  provinceName?: string
  permissions: PermissionCode[]
  avatarUrl?: string | null
}

export type UserRole =
  | 'ADMIN'
  | 'VIEWER'
  | 'INVENTORY_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'FIELD_ENGINEER'
  | 'PLANNER'
  | 'AUDITOR'
  | string 

export type PermissionCode =
  | 'USER_CREATE' | 'USER_READ' | 'USER_UPDATE' | 'USER_DELETE'
  | 'ROLE_CREATE' | 'ROLE_READ' | 'ROLE_UPDATE' | 'ROLE_DELETE'
  | 'ASSET_CREATE' | 'ASSET_READ' | 'ASSET_UPDATE' | 'ASSET_DELETE'
  | string 

export interface RolePermissionEntry {
  roleId: string
  permissionId: string
  permission?: {
    id: string
    code: PermissionCode
    description?: string
    createdAt?: string
    updatedAt?: string
  }
}

export interface RoleRef {
  id: string
  name: UserRole
  description?: string
  rolePermissions?: RolePermissionEntry[] 
  createdAt?: string
  updatedAt?: string
}

export interface ProvinceRef {
  id: string
  name: string
  code?: string
  geometry?: {
    type: string
    coordinates: [number, number]
  }
}


export interface RawApiUser {
  id: string
  fullName: string
  username: string
  isActive: boolean
  roleId: string
  provinceId?: string | null
  role?: RoleRef
  province?: ProvinceRef
  createdAt: string
  updatedAt: string
}

export type AuthUserResponse = RawApiUser

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  user?: AuthUserResponse
}

/** `POST /auth/refresh` accepts the token from the login response. */
export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * A refreshed access token. `refreshToken` only appears when the backend
 * rotates the refresh token as well.
 */
export interface RefreshTokenResponse {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
}

export interface UpdateMeRequest {
  fullName?: string
  username?: string
  provinceId?: string | null,
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}