import { apiFetch } from '@/lib/api'

const CLE = 'sa_visiteur'

/** Identifiant anonyme propre à ce navigateur (aucune IP, aucune donnée personnelle). */
function idVisiteur(): string {
  try {
    let v = localStorage.getItem(CLE)
    if (!v || v.length < 8) {
      v = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`)
      localStorage.setItem(CLE, v)
    }
    return v
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}${Date.now()}`
  }
}

/** Signale l'ouverture d'une boutique (ou d'un produit). Silencieux : ne bloque jamais l'écran. */
export function signalerVisite(boutique: number | string, produit?: number): void {
  if (typeof window === 'undefined') return
  const source = window.location.pathname.startsWith('/boutique/') ? 'lien' : 'app'
  apiFetch('visites/', {
    method: 'POST',
    auth: false,
    body: { boutique: String(boutique), produit, visiteur: idVisiteur(), source },
  }).catch(() => {})
}
