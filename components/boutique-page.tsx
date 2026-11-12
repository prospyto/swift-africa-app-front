'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Check, MapPin, Share2, Store } from 'lucide-react'
import { GlassCard, Skeleton } from '@/components/glass'
import { Catalog } from '@/components/catalog'
import { apiFetch } from '@/lib/api'
import type { Boutique } from '@/lib/types'

/** Page publique d'une boutique : visible aussi sans connexion. */
/** `id` : identifiant numérique OU slug (adresse /boutique/<slug>). */
export function BoutiquePage({ id, onBack }: { id: number | string; onBack: () => void }) {
  const [boutique, setBoutique] = useState<Boutique | null>(null)
  const [alleeId, setAlleeId] = useState<number | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [copie, setCopie] = useState(false)

  useEffect(() => {
    let annule = false
    setState('loading')
    setAlleeId(null)
    apiFetch<Boutique>(`boutiques/${encodeURIComponent(String(id))}/`, { auth: false })
      .then((b) => {
        if (annule) return
        setBoutique(b)
        setState('ok')
      })
      .catch(() => {
        if (!annule) setState('error')
      })
    return () => {
      annule = true
    }
  }, [id])

  return (
    <div>
      <div className="mx-auto max-w-7xl px-3 pt-6 md:px-6">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Retour
        </button>

        {state === 'loading' && (
          <GlassCard className="p-6">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="mt-3 h-4 w-2/3" />
          </GlassCard>
        )}

        {state === 'error' && (
          <GlassCard className="p-8 text-center text-muted-foreground">
            Cette boutique est introuvable.
          </GlassCard>
        )}

        {state === 'ok' && boutique && (
          <GlassCard className="flex items-start gap-4 p-5 md:p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Store className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-balance text-2xl font-bold tracking-tight">{boutique.nom}</h1>
              {boutique.description && (
                <p className="mt-1 text-sm text-muted-foreground">{boutique.description}</p>
              )}
              {boutique.slug && (
                <button
                  onClick={async () => {
                    const lien = `${window.location.origin}/boutique/${boutique.slug}`
                    try {
                      if (navigator.share) await navigator.share({ title: boutique.nom, url: lien })
                      else {
                        await navigator.clipboard.writeText(lien)
                        setCopie(true)
                        setTimeout(() => setCopie(false), 2000)
                      }
                    } catch {
                      /* partage annulé */
                    }
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  {copie ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
                  {copie ? 'Lien copié' : 'Partager cette boutique'}
                </button>
              )}
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {boutique.nb_produits} produit{boutique.nb_produits > 1 ? 's' : ''}
                </span>
                {(boutique.adresse_point_vente || boutique.villes.length > 0) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {boutique.adresse_point_vente || boutique.villes.join(', ')}
                  </span>
                )}
              </p>
            </div>
          </GlassCard>
        )}

        {state === 'ok' && boutique && (boutique.allees?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Allées de la boutique">
            {[{ id: null as number | null, nom: 'Toutes les allées' }, ...(boutique.allees ?? [])].map((a) => (
              <button
                key={a.id ?? 'toutes'}
                onClick={() => setAlleeId(a.id)}
                aria-pressed={alleeId === a.id}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  alleeId === a.id
                    ? 'bg-primary text-primary-foreground'
                    : 'glass text-muted-foreground hover:text-foreground'
                }`}
              >
                {a.nom}
              </button>
            ))}
          </div>
        )}
      </div>
      {state === 'ok' && boutique && <Catalog boutiqueId={boutique.id} alleeId={alleeId} />}
    </div>
  )
}
