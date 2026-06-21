'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Wallet,
  Star,
  Package,
  TrendingUp,
  ShieldCheck,
  Truck,
  ArrowRight,
  Percent,
  Plus,
  Pencil,
  Trash2,
  MapPin,
} from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { Button } from '@/components/ui/button'
import { useApp, formatXOF } from '@/lib/store'
import { apiFetch } from '@/lib/api'
import { ProductForm } from '@/components/product-form'
import { GPSTracker } from '@/components/gps-tracker'
import { WalletCard } from '@/components/wallet-card'
import { RatingStars } from '@/components/rating-stars'
import type { Product } from '@/lib/types'

export function Espace() {
  const { user, mode } = useApp()
  if (!user) return null

  // Le rôle actif est "mode" (switchable) ou user.role par défaut
  const activeRole = mode || user.role

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
          {user.prenom?.[0] ?? '?'}
          {user.nom?.[0] ?? ''}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bonjour {user.prenom}
          </h1>
          <p className="capitalize text-muted-foreground">
            Espace {activeRole}
          </p>
        </div>
      </div>

      {activeRole === 'acheteur' && <BuyerSpace />}
      {activeRole === 'vendeur' && <SellerSpace />}
      {activeRole === 'livreur' && <CourierSpace />}
    </section>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet
  label: string
  value: string
  accent?: 'primary' | 'success'
}) {
  const color =
    accent === 'success'
      ? 'bg-success/15 text-success'
      : 'bg-primary/15 text-primary'
  return (
    <GlassCard className="p-5">
      <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-bold">{value}</p>
    </GlassCard>
  )
}

// ─── ACHETEUR ────────────────────────────────────────────────
function BuyerSpace() {
  const { orders } = useApp()
  const escrow = orders
    .filter((o) => o.statut === 'finance' || o.statut === 'en_livraison')
    .reduce((s, o) => s + o.total, 0)
  const done = orders.filter((o) => o.statut === 'decaisse').length

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-2 content-start">
        <Stat icon={Package} label="Commandes" value={String(orders.length)} />
        <Stat icon={ShieldCheck} label="Fonds en Escrow" value={formatXOF(escrow)} accent="success" />
        <Stat icon={Truck} label="Livrées" value={String(done)} accent="success" />
        <Stat icon={Star} label="Score acheteur" value="4.8 / 5" />
      </div>
      <WalletCard />
    </div>
  )
}

// ─── VENDEUR ─────────────────────────────────────────────────
function SellerSpace() {
  const { refreshProducts } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [view, setView] = useState<'dashboard' | 'add' | 'edit'>('dashboard')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const COMMISSION = 0.88

  const loadMyProducts = useCallback(async () => {
    try {
      const data = await apiFetch<Product[]>('produits/?mine=1')
      setProducts(data)
    } catch {
      setProducts([])
    }
  }, [])

  useEffect(() => {
    loadMyProducts()
  }, [loadMyProducts])

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Supprimer définitivement ce produit ?')) return
    try {
      await apiFetch(`produits/${id}/`, { method: 'DELETE' })
      loadMyProducts()
      refreshProducts()
    } catch {
      window.alert('Impossible de supprimer ce produit.')
    }
  }, [loadMyProducts, refreshProducts])

  if (view === 'add' || view === 'edit') {
    return (
      <ProductForm
        product={editProduct ?? undefined}
        onSuccess={() => {
          setView('dashboard')
          setEditProduct(null)
          loadMyProducts()
          refreshProducts()
        }}
        onCancel={() => {
          setView('dashboard')
          setEditProduct(null)
        }}
      />
    )
  }

  return (
    <div className="grid gap-5">
      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat icon={Package} label="Produits en ligne" value={String(products.length)} />
        <Stat icon={Percent} label="Commission plateforme" value="12 %" accent="primary" />
        <Stat icon={Star} label="Score vendeur" value="4.9 / 5" accent="success" />
      </div>

      {/* Bouton ajouter */}
      <div className="flex justify-end">
        <Button
          onClick={() => { setEditProduct(null); setView('add') }}
          className="glass-cta flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Liste produits */}
      <GlassCard strong className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-success" />
          <h2 className="font-bold">Mes produits</h2>
        </div>

        {products.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="mx-auto mb-3 size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore de produits en ligne.
            </p>
            <Button
              onClick={() => { setEditProduct(null); setView('add') }}
              className="glass-cta mt-4 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Publier mon premier produit
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {products.map((p) => {
              const base = p.prix_solde ?? p.prix
              const gain = Math.round(base * COMMISSION)
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.nom}</p>
                    <p className="text-xs text-muted-foreground">{p.categorie} · {p.ville}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{formatXOF(base)}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                    <span className="font-bold text-success">{formatXOF(gain)}</span>
                    <button
                      onClick={() => { setEditProduct(p); setView('edit') }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}


// ─── MISSION CARD (livreur) ──────────────────────────────────
function MissionCard({ mission }: { mission: import('@/lib/types').Order }) {
  const { confirmOtp } = useApp()
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleConfirm() {
    if (!code || submitting) return
    setSubmitting(true)
    setOtpError(false)
    try {
      const ok = await confirmOtp(mission.id, code)
      if (ok) setConfirmed(true)
      else setOtpError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <li className="glass rounded-2xl p-4">
      {/* Trajet */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {mission.ville_depart}
          <ArrowRight className="size-4 text-primary" />
          {mission.ville_arrivee}
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {formatXOF(Math.round(mission.total * 0.08))} à percevoir
        </span>
      </div>

      {/* Formulaire OTP — visible quand en_livraison */}
      {mission.statut === 'en_livraison' && !confirmed && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <p className="text-xs font-semibold text-primary">
              Confirmer la livraison — Code OTP du client
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value); setOtpError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              maxLength={4}
              placeholder="0000"
              className={`w-24 rounded-xl border bg-input px-3 py-2 text-center text-xl font-bold tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${
                otpError ? 'border-destructive' : 'border-border'
              }`}
            />
            <button
              onClick={handleConfirm}
              disabled={code.length < 4 || submitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              {submitting ? 'Vérification…' : 'Valider'}
            </button>
          </div>
          {otpError && (
            <p className="mt-2 text-xs text-destructive">
              Code incorrect. Demandez à l'acheteur de vérifier son code.
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Entrez le code que l'acheteur vous montre à la livraison.
          </p>
        </div>
      )}

      {/* Confirmation + notation vendeur → livreur */}
      {(confirmed || mission.statut === 'livre' || mission.statut === 'decaisse') && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-sm font-semibold text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            Livraison confirmée — paiement en cours de traitement.
          </div>
          {mission.statut === 'decaisse' && (
            <RatingStars
              commandeId={mission.id}
              typeNote="vendeur_livreur"
              label="le livreur"
            />
          )}
        </div>
      )}
    </li>
  )
}

// ─── LIVREUR ─────────────────────────────────────────────────
interface MissionDisponible {
  id: number
  ville_depart_nom: string | null
  ville_arrivee_nom: string | null
  adresse_precise: string
  prix_livraison: string
}

function CourierSpace() {
  const { orders, refreshOrders } = useApp()
  const [disponibles, setDisponibles] = useState<MissionDisponible[]>([])
  const [loadingDispo, setLoadingDispo] = useState(true)
  const [accepting, setAccepting] = useState<number | null>(null)

  const loadDisponibles = useCallback(async () => {
    setLoadingDispo(true)
    try {
      const data = await apiFetch<MissionDisponible[]>('missions/disponibles/')
      setDisponibles(data)
    } catch {
      setDisponibles([])
    } finally {
      setLoadingDispo(false)
    }
  }, [])

  useEffect(() => {
    loadDisponibles()
    const interval = setInterval(loadDisponibles, 20_000)
    return () => clearInterval(interval)
  }, [loadDisponibles])

  async function handleAccepter(missionId: number) {
    setAccepting(missionId)
    try {
      await apiFetch(`missions/${missionId}/accepter/`, { method: 'POST' })
      await loadDisponibles()
      await refreshOrders()
    } catch {
      window.alert("Impossible d'accepter cette mission (peut-être déjà prise).")
    } finally {
      setAccepting(null)
    }
  }

  const missions = orders.filter(
    (o) => o.statut === 'finance' || o.statut === 'en_livraison',
  )
  const wallet = orders
    .filter((o) => o.statut === 'decaisse')
    .reduce((s, o) => s + Math.round(o.total * 0.08), 0)

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat icon={Truck} label="Missions actives" value={String(missions.length)} />
        <Stat icon={Wallet} label="Wallet livreur" value={formatXOF(wallet)} accent="success" />
        <Stat icon={Star} label="Score de confiance" value="4.7 / 5" accent="primary" />
      </div>

      <GlassCard strong className="p-5 md:p-6">
        <h2 className="mb-4 font-bold">Missions disponibles</h2>
        {loadingDispo ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Chargement…</p>
        ) : disponibles.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune mission disponible pour le moment.
          </p>
        ) : (
          <ul className="grid gap-3">
            {disponibles.map((m) => (
              <li
                key={m.id}
                className="glass flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {m.ville_depart_nom || '?'}
                    <ArrowRight className="size-4 text-primary" />
                    {m.ville_arrivee_nom || '?'}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.adresse_precise}</p>
                </div>
                <Button
                  onClick={() => handleAccepter(m.id)}
                  disabled={accepting === m.id}
                  className="glass-cta rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {accepting === m.id ? '…' : `Accepter (${formatXOF(Number(m.prix_livraison))})`}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard strong className="p-5 md:p-6">
        <h2 className="mb-4 font-bold">Mes missions</h2>
        {missions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune mission en cours. Les commandes financées apparaîtront ici.
          </p>
        ) : (
          <ul className="grid gap-4">
            {missions.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </ul>
        )}
      </GlassCard>

      {/* GPS — visible dès qu'une mission est en cours */}
      {(() => {
        const missionActive = missions.find((m) => m.mission_id && m.statut === 'en_livraison')
          ?? missions.find((m) => m.mission_id)
        if (!missionActive?.mission_id) return null
        return (
          <GlassCard strong className="p-5 md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <MapPin className="size-5 text-primary" />
              GPS — Mission en cours
            </h2>
            <div className="mb-3 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
              {missionActive.ville_depart} → {missionActive.ville_arrivee}
            </div>
            <GPSTracker missionId={missionActive.mission_id} />
          </GlassCard>
        )
      })()}
    </div>
  )
}
