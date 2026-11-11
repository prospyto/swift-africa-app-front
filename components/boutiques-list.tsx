'use client'

import { useEffect, useState } from 'react'
import { MapPin, Search, Store } from 'lucide-react'
import { GlassCard, Skeleton } from '@/components/glass'
import { apiFetch } from '@/lib/api'
import type { Boutique } from '@/lib/types'

/** Liste publique des boutiques : accueil du visiteur, onglet « Boutiques » de l'acheteur. */
export function BoutiquesList({
  onOpenBoutique,
  titre = 'Les boutiques',
  sousTitre = 'Choisissez une boutique et commandez en toute confiance.',
}: {
  onOpenBoutique: (id: number) => void
  titre?: string
  sousTitre?: string
}) {
  const [boutiques, setBoutiques] = useState<Boutique[] | null>(null)
  const [erreur, setErreur] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let annule = false
    apiFetch<Boutique[]>('boutiques/', { auth: false })
      .then((b) => !annule && setBoutiques(b))
      .catch(() => !annule && setErreur(true))
    return () => {
      annule = true
    }
  }, [])

  const visibles = (boutiques ?? []).filter((b) => {
    const q = query.trim().toLowerCase()
    return !q || b.nom.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
  })

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 md:px-6">
      <div className="mb-5">
        <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">{titre}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une boutique…"
          aria-label="Rechercher une boutique"
          className="w-full rounded-2xl border border-border bg-input py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {boutiques === null && !erreur && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {erreur && (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">
          Impossible de charger les boutiques. Le serveur se réveille peut-être : réessayez dans une minute.
        </GlassCard>
      )}

      {boutiques && visibles.length === 0 && (
        <GlassCard className="p-8 text-center text-sm text-muted-foreground">
          {boutiques.length === 0
            ? "Aucune boutique n'a encore publié de produits."
            : 'Aucune boutique ne correspond à votre recherche.'}
        </GlassCard>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((b) => (
          <li key={b.id}>
            <button
              onClick={() => onOpenBoutique(b.id)}
              className="glass-strong flex h-full w-full items-start gap-3 rounded-3xl p-4 text-left transition hover:-translate-y-0.5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold">{b.nom}</span>
                {b.description && (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{b.description}</span>
                )}
                <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>
                    {b.nb_produits} produit{b.nb_produits > 1 ? 's' : ''}
                  </span>
                  {b.villes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {b.villes.slice(0, 2).join(', ')}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
