// Global API layer for Swift Africa.
// Talks to the Django backend, with an automatic local demo fallback
// whenever the server is unreachable (offline / not started).

export const API_BASE_URL = 
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://127.0.0.1:8000/api/'

const TOKEN_KEY = 'sa_token'
const ROLE_KEY = 'sa_role'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token: string, role: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function getStoredRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ROLE_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Raised when the Django server cannot be reached, so callers can
// transparently switch to local demo data.
export class OfflineError extends Error {
  constructor() {
    super('Serveur Django injoignable — bascule en mode démo local.')
  }
}

let offlineNotified = false

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint.replace(/^\//, '')}`

  let response: Response
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(6000),
    })
  } catch {
    // Network failure / timeout → trigger demo fallback
    if (!offlineNotified && typeof window !== 'undefined') {
      offlineNotified = true
      window.dispatchEvent(new CustomEvent('sa:offline'))
    }
    throw new OfflineError()
  }

  // Session handling: expired or invalid token
  if (response.status === 401 || response.status === 403) {
    clearSession()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:unauthorized'))
    }
    throw new ApiError(response.status, 'Session expirée, veuillez vous reconnecter.')
  }

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    try {
      const data = await response.json()
      message = data?.detail || data?.message || message
    } catch {
      /* noop */
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function isOfflineError(err: unknown): err is OfflineError {
  return err instanceof OfflineError
}
