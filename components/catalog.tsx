'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { MapPin, Plus, Check, Search } from 'lucide-react'
import { GlassCard, Skeleton } from '@/components/glass'
import { useApp, formatXOF } from '@/lib/store'
import type { Product } from '@/lib/types'

export function Catalog() {
  const { products, productsLoading, addToCart, cart } = useApp()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('Tous')
  const [added, setAdded] = useState<number | null>(null)

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(products.map((p) => p.categorie)))],
    [products],
  )

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === 'Tous' || p.categorie === cat) &&
          (p.nom.toLowerCase().includes(query.toLowerCase()) ||
            p.vendeur.toLowerCase().includes(query.toLowerCase())),
      ),
    [products, cat, query],
  )

  function handleAdd(p: Product) {
    addToCart(p)
    setAdded(p.id)
    setTimeout(() => setAdded((cur) => (cur === p.id ? null : cur)), 1200)
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Collection Premium
          </h1>
          <p className="mt-1 text-muted-foreground">
            Du mobilier d&apos;exception, disponible pour tous les rôles.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="glass flex flex-1 items-center gap-2 rounded-2xl px-4 py-2.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un meuble, un vendeur…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  cat === c
                    ? 'bg-primary text-primary-foreground'
                    : 'glass text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {productsLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="overflow-hidden p-4">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-4 h-10 w-full" />
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const inCart = cart.some((i) => i.product.id === p.id)
            const onSale = p.prix_solde != null && p.prix_solde < p.prix
            return (
              <GlassCard
                key={p.id}
                className="group flex flex-col overflow-hidden p-4 transition hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                  <Image
                    src={p.image_url || p.image || '/placeholder.svg'}
                    alt={p.nom}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  {onSale && (
                    <span className="absolute left-3 top-3 rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
                      Solde
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold leading-snug">{p.nom}</h3>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
                      {p.categorie}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {p.vendeur} · {p.ville}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      {onSale ? (
                        <>
                          <p className="text-lg font-bold text-success">
                            {formatXOF(p.prix_solde as number)}
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatXOF(p.prix)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold">{formatXOF(p.prix)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      className={`glass-cta flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                        added === p.id
                          ? 'bg-success text-success-foreground'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {added === p.id ? (
                        <>
                          <Check className="size-4" /> Ajouté
                        </>
                      ) : (
                        <>
                          <Plus className="size-4" />
                          {inCart ? 'Encore' : 'Panier'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            )
          })}

          {filtered.length === 0 && (
            <GlassCard className="col-span-full p-12 text-center text-muted-foreground">
              Aucun produit ne correspond à votre recherche.
            </GlassCard>
          )}
        </div>
      )}
    </section>
  )
}
