export function hasPermission(
  user: any,
  permission: string
): boolean {
  if (!user) return false;

  // ✅ SUPERUSER FULL ACCESS
  if (user.is_superuser) return true;

  if (!user.permissions) return false;

  return user.permissions.includes(permission);
}