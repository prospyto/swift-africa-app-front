// Global API layer for Swift Africa.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://swift-africa-backend.onrender.com/api/'

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

export class OfflineError extends Error {
  constructor() {
    super('Serveur injoignable. Vérifiez votre connexion.')
  }
}

let offlineNotified = false

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

const FAST_TIMEOUT_MS = 8000
const WAKE_TIMEOUT_MS = 45000

// Parse les erreurs Django qui peuvent être de plusieurs formats :
// { detail: "..." } ou { username: ["..."] } ou { email: ["..."] } etc.
function parseDjangoError(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Erreur inconnue'
  const d = data as Record<string, unknown>

  // Format standard DRF
  if (typeof d.detail === 'string') return d.detail

  // Format validation par champ : { username: ["A user with..."], email: [...] }
  const fieldMessages: string[] = []
  for (const key of Object.keys(d)) {
    const val = d[key]
    if (Array.isArray(val)) {
      const msgs = val.map((v) => String(v)).join(', ')
      // Traduire les messages courants
      const translated = msgs
        .replace('A user with that username already exists.', 'Ce compte existe déjà.')
        .replace('This field may not be blank.', 'Ce champ est obligatoire.')
        .replace('This field is required.', 'Ce champ est obligatoire.')
        .replace('Enter a valid email address.', 'Email invalide.')
        .replace('No active account found with the given credentials', 'Email ou mot de passe incorrect.')
      fieldMessages.push(translated)
    } else if (typeof val === 'string') {
      fieldMessages.push(val)
    }
  }
  if (fieldMessages.length > 0) return fieldMessages.join(' ')

  return 'Une erreur est survenue.'
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

  const fetchOptions: RequestInit = {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }

  let response: Response
  try {
    response = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(FAST_TIMEOUT_MS) })
  } catch {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:waking'))
    }
    try {
      response = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(WAKE_TIMEOUT_MS) })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sa:awake'))
      }
    } catch {
      if (!offlineNotified && typeof window !== 'undefined') {
        offlineNotified = true
        window.dispatchEvent(new CustomEvent('sa:offline'))
      }
      throw new OfflineError()
    }
  }

  if (response.status === 401 || response.status === 403) {
    clearSession()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:unauthorized'))
    }
    throw new ApiError(response.status, 'Email ou mot de passe incorrect.')
  }

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    try {
      const data = await response.json()
      message = parseDjangoError(data)
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
