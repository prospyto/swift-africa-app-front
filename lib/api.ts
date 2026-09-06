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

  // Render (plan gratuit) ferme activement la connexion (ERR_CONNECTION_CLOSED)
  // pendant qu'il réveille l'instance, au lieu de faire patienter la requête.
  // Un simple "retry une fois avec un timeout plus long" ne suffit donc pas :
  // le 2e essai peut se faire fermer tout aussi vite si l'instance n'est
  // toujours pas prête. On retente plusieurs fois avec un vrai délai entre
  // chaque tentative, jusqu'à couvrir le temps de réveil annoncé (~50-60s).
  const WAKE_RETRY_DELAY_MS = 4000
  const MAX_WAKE_ATTEMPTS = 12 // ~ (8s premier essai) + 11 * (4s pause + 8s essai) ≈ 140s de marge

  let response: Response
  try {
    response = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(FAST_TIMEOUT_MS) })
  } catch {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:waking'))
    }

    let lastError: unknown
    response = undefined as unknown as Response
    for (let attempt = 1; attempt <= MAX_WAKE_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_DELAY_MS))
      try {
        response = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(FAST_TIMEOUT_MS) })
        lastError = undefined
        break
      } catch (err) {
        lastError = err
      }
    }

    if (lastError !== undefined) {
      if (!offlineNotified && typeof window !== 'undefined') {
        offlineNotified = true
        window.dispatchEvent(new CustomEvent('sa:offline'))
      }
      throw new OfflineError()
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:awake'))
    }
  }

  if (response.status === 401 || response.status === 403) {
    let message = 'Accès refusé.'
    try {
      const data = await response.json()
      message = parseDjangoError(data)
    } catch {
      /* noop */
    }
    if (response.status === 401) {
      // 401 = session absente/invalide -> déconnexion.
      // 403 = session valide mais action non autorisée (ex: tenter de
      // pousser une position GPS sur une mission qui n'est pas la
      // sienne) -> ne PAS déconnecter l'utilisateur pour ça.
      clearSession()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sa:unauthorized'))
      }
    }
    throw new ApiError(response.status, message)
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
