// Multipart (FormData) variant of apiFetch, for endpoints that accept
// file uploads (e.g. product images). We deliberately do NOT set a
// Content-Type header: the browser sets it automatically with the
// correct multipart boundary when the body is a FormData instance.

import {
  API_BASE_URL,
  ApiError,
  OfflineError,
  clearSession,
  getToken,
} from './api'

const FAST_TIMEOUT_MS = 6000
const WAKE_TIMEOUT_MS = 30000

export interface MultipartFetchOptions {
  method?: string
  body: FormData
  auth?: boolean
}

export async function multipartFetch<T = unknown>(
  endpoint: string,
  options: MultipartFetchOptions,
): Promise<T> {
  const { method = 'POST', body, auth = true } = options

  const headers: Record<string, string> = {}
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint.replace(/^\//, '')}`

  const fetchOptions: RequestInit = { method, headers, body }

  let response: Response
  try {
    response = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(FAST_TIMEOUT_MS) })
  } catch {
    // Likely a Render cold start. Retry once with a much longer timeout,
    // signaling the UI that the server is waking up (same convention as
    // apiFetch in lib/api.ts).
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sa:waking'))
    }
    try {
      response = await fetch(url, { ...fetchOptions, signal: AbortSignal.timeout(WAKE_TIMEOUT_MS) })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sa:awake'))
      }
    } catch {
      if (typeof window !== 'undefined') {
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
