import type { AccessControlProvider } from '@refinedev/core'
import { currentPermissions, type Permission } from './authProvider'

/**
 * The permission each action needs, mirroring the backend's @PreAuthorize rules. An action not
 * listed needs only a login. The backend enforces these anyway; this only hides what would be
 * refused with 403.
 */
const REQUIRED: Record<string, Record<string, Permission>> = {
  customers: { create: 'CUSTOMER_REGISTER' },
}

export const accessControlProvider: AccessControlProvider = {
  async can({ resource, action }) {
    const needed = resource ? REQUIRED[resource]?.[action] : undefined
    if (!needed) return { can: true }
    const permissions = await currentPermissions()
    return permissions.includes(needed)
      ? { can: true }
      : { can: false, reason: `Requires the ${needed} permission` }
  },
  options: { buttons: { enableAccessControl: true, hideIfUnauthorized: true } },
}
