'use client'

import { useState } from 'react'
import {
  Wallet,
  Star,
  Package,
  TrendingUp,
  ShieldCheck,
  Truck,
  ArrowRight,
  Percent,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { useApp, formatXOF } from '@/lib/store'
import { AddProductForm } from '@/components/add-product-form'
import { GPSTracker } from '@/components/gps-tracker'

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
  delay = 0,
}: {
  icon: typeof Wallet
  label: string
  value: string
  accent?: 'primary' | 'success'
  delay?: number
}) {
  const color =
    accent === 'success'
      ? 'bg-success/15 text-success'
      : 'bg-primary/15 text-primary'
  return (
    <div
      className="transition-all duration-500 transform opacity-100 translate-y-0 animate-in fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <GlassCard className="p-5">
        <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-bold">{value}</p>
      </GlassCard>
    </div>
  )
}

function BuyerSpace() {
  const { orders } = useApp()
  const [showAddresses, setShowAddresses] = useState(false)
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'home', street: '123 Rue de Dakar', city: 'Dakar', isDefault: true },
    { id: 2, type: 'work', street: '456 Avenue Business', city: 'Dakar', isDefault: false },
  ])

  const escrow = orders
    .filter((o) => o.statut === 'finance' || o.statut === 'en_livraison')
    .reduce((s, o) => s + o.total, 0)
  const done = orders.filter((o) => o.statut === 'decaisse').length

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Commandes" value={String(orders.length)} delay={0} />
        <Stat
          icon={ShieldCheck}
          label="Fonds en Escrow"
          value={formatXOF(escrow)}
          accent="success"
          delay={50}
        />
        <Stat icon={Truck} label="Livrées" value={String(done)} accent="success" delay={100} />
        <Stat icon={Star} label="Score acheteur" value="4.8 / 5" delay={150} />
      </div>

      <GlassCard strong className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="font-bold">Mes adresses de livraison</h2>
          </div>
          <button
            onClick={() => setShowAddresses(!showAddresses)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showAddresses ? 'Masquer' : 'Gérer'} +
          </button>
        </div>

        {showAddresses && (
          <div className="space-y-3">
            {addresses.map((addr, i) => (
              <div
                key={addr.id}
                className="flex items-center justify-between rounded-2xl bg-secondary p-3 animate-in fade-in transition-all"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase text-primary capitalize">
                    {addr.type} {addr.isDefault && '(par défaut)'}
                  </p>
                  <p className="text-sm">{addr.street}</p>
                  <p className="text-xs text-muted-foreground">{addr.city}</p>
                </div>
                <button
                  onClick={() => setAddresses(addresses.filter((a) => a.id !== addr.id))}
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button className="w-full rounded-2xl border-2 border-dashed border-primary/30 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition">
              <Plus className="inline size-4 mr-2" />
              Ajouter une adresse
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

function SellerSpace() {
  const { products } = useApp()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const COMMISSION = 0.88
  
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div className="grid gap-5 sm:grid-cols-3 flex-1">
          <Stat
            icon={Package}
            label="Produits en ligne"
            value={String(products.length)}
            delay={0}
          />
          <Stat
            icon={Percent}
            label="Commission plateforme"
            value="12 %"
            accent="primary"
            delay={50}
          />
          <Stat icon={Star} label="Score vendeur" value="4.9 / 5" accent="success" delay={100} />
        </div>
      </div>

      <GlassCard strong className="p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-success" />
            <h2 className="font-bold">Gains nets par produit (Prix × 0.88)</h2>
          </div>
          <AddProductForm onProductAdded={() => setRefreshTrigger(p => p + 1)} />
        </div>
        <ul className="divide-y divide-border/60">
          {products.slice(0, 5).map((p, i) => {
            const base = p.prix_solde ?? p.prix
            const gain = Math.round(base * COMMISSION)
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 py-3 animate-in fade-in transition-all"
                style={{ animationDelay: `${i * 50}ms` }}
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
          delay={0}
        />
        <Stat
          icon={Wallet}
          label="Wallet livreur"
          value={formatXOF(wallet)}
          accent="success"
          delay={50}
        />
        <Stat
          icon={Star}
          label="Score de confiance"
          value="4.7 / 5"
          accent="primary"
          delay={100}
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
            {missions.map((m, i) => (
              <li
                key={m.id}
                className="glass flex items-center justify-between gap-3 rounded-2xl p-4 animate-in fade-in transition-all"
                style={{ animationDelay: `${i * 50}ms` }}
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

      {/* GPS Tracking for active missions */}
      {missions.length > 0 && (
        <GlassCard strong className="p-5 md:p-6">
          <h2 className="mb-4 font-bold flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            Suivi GPS
          </h2>
          <GPSTracker missionId={missions[0].id} />
        </GlassCard>
      )}
    </div>
  )
}
