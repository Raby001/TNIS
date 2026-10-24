export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/app/users-roles': 'USER_READ',
  '/app/system-logs': 'LOG_READ',
  '/app/system-settings': 'SETTING_READ',
}

export function canAccessRoute(
  path: string,
  auth: { isAdmin: () => boolean; can: (code: string) => boolean },
): boolean {
  const requiredPermission = ROUTE_PERMISSIONS[path]
  if (!requiredPermission) return true
  return auth.isAdmin() || auth.can(requiredPermission)
}