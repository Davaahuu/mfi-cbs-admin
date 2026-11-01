/**
 * The login token. Kept in sessionStorage: it survives a page reload but not closing the tab, and
 * is never shared with other tabs. Any script running on the page can read it, so the app must
 * not render untrusted HTML; an HttpOnly refresh cookie would be the stronger option later.
 */
const KEY = 'cbs.token'

export interface StoredToken {
  accessToken: string
  /** ISO-8601 instant from the backend. */
  expiresAt: string
}

let current: StoredToken | null = read()

function read(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoredToken) : null
  } catch {
    return null
  }
}

export function getToken(): StoredToken | null {
  if (current && Date.parse(current.expiresAt) <= Date.now()) {
    clearToken()
  }
  return current
}

export function setToken(token: StoredToken): void {
  current = token
  sessionStorage.setItem(KEY, JSON.stringify(token))
}

export function clearToken(): void {
  current = null
  sessionStorage.removeItem(KEY)
}

/** True when the token expires within {@code ms} milliseconds and should be refreshed. */
export function expiresWithin(token: StoredToken, ms: number): boolean {
  return Date.parse(token.expiresAt) - Date.now() < ms
}
