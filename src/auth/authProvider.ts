import type { AuthProvider } from '@refinedev/core'
import { api, type Schemas } from '../api/client'
import { toHttpError } from '../api/errors'
import { clearToken, getToken, setToken } from './token'

export type Me = Schemas['Me']
export type Permission = NonNullable<Me['permissions']>[number]

export interface LoginForm {
  username: string
  password: string
}

/** The logged-in user, loaded once per page load and after login; cleared at logout. */
let me: Promise<Me | null> | null = null

function loadMe(): Promise<Me | null> {
  if (!getToken()) return Promise.resolve(null)
  me ??= api.GET('/api/auth/me').then(({ data }) => data ?? null)
  return me
}

/** Login, logout and session checks against the CBS JWT endpoints. */
export const authProvider: AuthProvider = {
  async login({ username, password }: LoginForm) {
    const { data, error, response } = await api.POST('/api/auth/login', { body: { username, password } })
    if (error || !data?.accessToken || !data.expiresAt) {
      return { success: false, error: { name: 'Login failed', ...toHttpError(response, error) } }
    }
    setToken({ accessToken: data.accessToken, expiresAt: data.expiresAt })
    me = Promise.resolve(data.user ?? null)
    return { success: true, redirectTo: '/' }
  },

  async logout() {
    const token = getToken()
    // Forget it here first, so no request still in flight goes out with a token about to be revoked.
    clearToken()
    me = null
    if (token) {
      // Ends the token on the server too, so it cannot be used again even if it leaked.
      await api
        .POST('/api/auth/logout', { headers: { Authorization: `Bearer ${token.accessToken}` } })
        .catch(() => undefined)
    }
    return { success: true, redirectTo: '/login' }
  },

  async check() {
    if (!getToken()) return { authenticated: false, redirectTo: '/login', logout: true }
    const user = await loadMe()
    return user ? { authenticated: true } : { authenticated: false, redirectTo: '/login', logout: true }
  },

  async onError(error: { statusCode?: number }) {
    // 401: the token expired, was revoked, or the user was disabled. 403 stays on the page.
    if (error?.statusCode === 401) return { logout: true, redirectTo: '/login', error: error as Error }
    return {}
  },

  async getIdentity() {
    const user = await loadMe()
    // The layout header shows `name`.
    return user ? { ...user, name: user.displayName || user.username } : null
  },

  async getPermissions() {
    return (await loadMe())?.permissions ?? []
  },
}

/** The permissions of the logged-in user, for access checks. */
export async function currentPermissions(): Promise<Permission[]> {
  return (await loadMe())?.permissions ?? []
}
