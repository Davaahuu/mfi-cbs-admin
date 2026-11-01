import createClient, { type Middleware } from 'openapi-fetch'
import { clearToken, expiresWithin, getToken, setToken } from '../auth/token'
import type { components, paths } from './schema'

export type Schemas = components['schemas']

/** Typed client for the CBS API; request and response types come from openapi/cbs-api.json. */
export const api = createClient<paths>({ baseUrl: '' })

/** Refresh a token this close to expiry before using it. */
const REFRESH_MARGIN_MS = 2 * 60 * 1000

let refreshing: Promise<void> | null = null

/** Exchanges the current token for a new one; concurrent callers share one request. */
export function refreshToken(): Promise<void> {
  refreshing ??= (async () => {
    const token = getToken()
    if (!token) return
    // Plain fetch: going through the client would run this middleware again.
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.accessToken}` },
    })
    if (!response.ok) {
      clearToken()
      return
    }
    const body = (await response.json()) as Schemas['TokenView']
    setToken({ accessToken: body.accessToken!, expiresAt: body.expiresAt! })
  })().finally(() => {
    refreshing = null
  })
  return refreshing
}

const auth: Middleware = {
  async onRequest({ request }) {
    const path = new URL(request.url).pathname
    if (path === '/api/auth/login') return request
    let token = getToken()
    if (token && path !== '/api/auth/refresh' && expiresWithin(token, REFRESH_MARGIN_MS)) {
      await refreshToken()
      token = getToken()
    }
    if (token) {
      request.headers.set('Authorization', `Bearer ${token.accessToken}`)
    } else if (!request.headers.has('Authorization')) {
      // Not logged in (e.g. a query refetching just after logout): answer as the server would,
      // without a pointless round trip.
      return new Response(JSON.stringify({ title: 'Unauthorized', status: 401, detail: 'Log in first' }), {
        status: 401,
        headers: { 'Content-Type': 'application/problem+json' },
      })
    }
    return request
  },
}

api.use(auth)
