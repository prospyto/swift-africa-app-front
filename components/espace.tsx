'use client'

import {
  Wallet,
  Star,
  Package,
  TrendingUp,
  ShieldCheck,
  Truck,
  ArrowRight,
  Percent,
} from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { useApp, formatXOF } from '@/lib/store'

export function Espace() {
  const { user } = useApp()
  if (!user) return null

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
          {user.prenom[0]}
          {user.nom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bonjour {user.prenom}
          </h1>
          <p className="capitalize text-muted-foreground">
            Espace {user.role}
          </p>
        </div>
      </div>

      {user.role === 'acheteur' && <BuyerSpace />}
      {user.role === 'vendeur' && <SellerSpace />}
      {user.role === 'livreur' && <CourierSpace />}
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

function BuyerSpace() {
  const { orders } = useApp()
  const escrow = orders
    .filter((o) => o.statut === 'finance' || o.statut === 'en_livraison')
    .reduce((s, o) => s + o.total, 0)
  const done = orders.filter((o) => o.statut === 'decaisse').length

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Stat icon={Package} label="Commandes" value={String(orders.length)} />
      <Stat
        icon={ShieldCheck}
        label="Fonds en Escrow"
        value={formatXOF(escrow)}
        accent="success"
      />
      <Stat icon={Truck} label="Livrées" value={String(done)} accent="success" />
      <Stat icon={Star} label="Score acheteur" value="4.8 / 5" />
    </div>
  )
}

function SellerSpace() {
  const { products } = useApp()
  const COMMISSION = 0.88
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat
          icon={Package}
          label="Produits en ligne"
          value={String(products.length)}
        />
        <Stat
          icon={Percent}
          label="Commission plateforme"
          value="12 %"
          accent="primary"
        />
        <Stat icon={Star} label="Score vendeur" value="4.9 / 5" accent="success" />
      </div>

      <GlassCard strong className="p-5 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-success" />
          <h2 className="font-bold">Gains nets par produit (Prix × 0.88)</h2>
        </div>
        <ul className="divide-y divide-border/60">
          {products.slice(0, 5).map((p) => {
            const base = p.prix_solde ?? p.prix
            const gain = Math.round(base * COMMISSION)
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="text-sm font-medium">{p.nom}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatXOF(base)}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                  <span className="font-bold text-success">
                    {formatXOF(gain)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </GlassCard>
    </div>
  )
}

function CourierSpace() {
  const { orders } = useApp()
  const missions = orders.filter(
    (o) => o.statut === 'finance' || o.statut === 'en_livraison',
  )
  const wallet = orders
    .filter((o) => o.statut === 'decaisse')
    .reduce((s, o) => s + Math.round(o.total * 0.08), 0)

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat
          icon={Truck}
          label="Missions actives"
          value={String(missions.length)}
        />
        <Stat
          icon={Wallet}
          label="Wallet livreur"
          value={formatXOF(wallet)}
          accent="success"
        />
        <Stat
          icon={Star}
          label="Score de confiance"
          value="4.7 / 5"
          accent="primary"
        />
      </div>

      <GlassCard strong className="p-5 md:p-6">
        <h2 className="mb-4 font-bold">Mes missions</h2>
        {missions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune mission en cours. Les commandes financées apparaîtront ici.
          </p>
        ) : (
          <ul className="grid gap-3">
            {missions.map((m) => (
              <li
                key={m.id}
                className="glass flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {m.ville_depart}
                  <ArrowRight className="size-4 text-primary" />
                  {m.ville_arrivee}
                </div>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {formatXOF(Math.round(m.total * 0.08))} à percevoir
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
