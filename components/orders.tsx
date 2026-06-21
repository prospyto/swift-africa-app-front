'use client'

import { useState } from 'react'
import {
  ArrowRight, ShieldCheck, Truck, PackageCheck,
  Wallet, Star, KeyRound, CheckCircle2,
  CircleDollarSign, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass'
import { MessagingModal } from '@/components/messaging-modal'
import { useApp, formatXOF } from '@/lib/store'
import type { Order, OrderStatus, Role } from '@/lib/types'

const STEPS: { key: OrderStatus; label: string; icon: typeof Truck }[] = [
  { key: 'en_attente', label: 'En attente', icon: CircleDollarSign },
  { key: 'finance', label: 'Financée', icon: ShieldCheck },
  { key: 'en_livraison', label: 'En livraison', icon: Truck },
  { key: 'decaisse', label: 'Décaissée', icon: Wallet },
]

const ORDER_RANK: Record<OrderStatus, number> = {
  en_attente: 0, finance: 1, en_livraison: 2, livre: 2, decaisse: 3,
}

const EMPTY_TEXT: Record<string, { title: string; subtitle: string }> = {
  acheteur: {
    title: 'Aucune commande pour le moment',
    subtitle: 'Vos achats financés via Escrow apparaîtront ici avec leur suivi en temps réel.',
  },
  vendeur: {
    title: 'Aucune commande reçue',
    subtitle: 'Les commandes passées sur vos produits apparaîtront ici.',
  },
  livreur: {
    title: 'Aucune mission disponible',
    subtitle: 'Les livraisons qui vous sont assignées apparaîtront ici.',
  },
}

export function Orders() {
  const { orders, mode, user } = useApp()
  const [messagingOrderId, setMessagingOrderId] = useState<number | null>(null)

  const activeRole = mode || user?.role || 'acheteur'
  const emptyText = EMPTY_TEXT[activeRole] ?? EMPTY_TEXT.acheteur

  if (orders.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-3 py-10 md:px-6">
        <GlassCard className="flex flex-col items-center gap-3 p-12 text-center">
          <PackageCheck className="size-10 text-muted-foreground/50" />
          <h2 className="text-lg font-bold">{emptyText.title}</h2>
          <p className="text-sm text-muted-foreground">{emptyText.subtitle}</p>
        </GlassCard>
      </section>
    )
  }

  const title =
    activeRole === 'vendeur'
      ? 'Commandes reçues'
      : activeRole === 'livreur'
        ? 'Mes missions'
        : 'Mes commandes'

  return (
    <>
      <section className="mx-auto max-w-3xl px-3 py-6 md:px-6 md:py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <div className="grid gap-5">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              activeRole={activeRole}
              onOpenMessages={() => setMessagingOrderId(o.id)}
            />
          ))}
        </div>
      </section>

      {messagingOrderId !== null && (
        <MessagingModal
          orderId={messagingOrderId}
          open={messagingOrderId !== null}
          onClose={() => setMessagingOrderId(null)}
        />
      )}
    </>
  )
}

function OrderCard({ order, activeRole, onOpenMessages }: { order: Order; activeRole: Role; onOpenMessages: () => void }) {
  const { fundOrder, confirmOtp, decaisserOrder, rateOrder } = useApp()
  const [code, setCode] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [rating, setRating] = useState(0)
  const [decaissing, setDecaissing] = useState(false)
  const [funding, setFunding] = useState(false)
  const [fundError, setFundError] = useState<string | null>(null)
  const rank = ORDER_RANK[order.statut]

  async function handleConfirm() {
    const ok = await confirmOtp(order.id, code)
    setOtpError(!ok)
  }

  async function handleFund() {
    setFunding(true)
    setFundError(null)
    try {
      await fundOrder(order.id)
    } catch (err) {
      setFundError(
        err instanceof Error ? err.message : 'Impossible de financer cette commande.',
      )
    } finally {
      setFunding(false)
    }
  }

  async function handleDecaisser() {
    setDecaissing(true)
    try {
      await decaisserOrder(order.id)
    } finally {
      setDecaissing(false)
    }
  }

  return (
    <GlassCard strong className="p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Commande #{String(order.id).slice(-6)}</p>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
            {order.ville_depart}
            <ArrowRight className="size-4 text-primary" />
            {order.ville_arrivee}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Bouton Messages — 3 canaux acheteur/vendeur/livreur */}
          <button
            onClick={onOpenMessages}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
          >
            <MessageSquare className="size-4" />
            Messages
          </button>
          <div className="text-right">
            <p className="text-lg font-bold">{formatXOF(order.total)}</p>
            <p className="text-xs text-muted-foreground">
              {order.produits.reduce((s, i) => s + i.quantite, 0)} article(s)
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5 flex items-center">
        {STEPS.map((step, i) => {
          const done = rank >= i
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`flex size-9 items-center justify-center rounded-xl transition ${
                  done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <step.icon className="size-4" />
                </div>
                <span className="hidden text-[10px] text-muted-foreground sm:block">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 rounded-full ${rank > i ? 'bg-success' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Financement (escrow) — étape manquante avant cette correction */}
      {order.statut === 'en_attente' && activeRole === 'acheteur' && (
        <div className="mt-4">
          {fundError && (
            <p className="mb-2 text-sm text-destructive">{fundError}</p>
          )}
          <Button
            onClick={handleFund}
            disabled={funding}
            className="glass-cta h-11 w-full rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Wallet className="mr-2 size-4" />
            {funding ? 'Financement…' : `Financer (${formatXOF(order.total)})`}
          </Button>
        </div>
      )}

      {/* OTP acheteur */}
      {order.statut === 'finance' && order.otp && activeRole === 'acheteur' && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-success/10 p-4 text-success">
          <KeyRound className="size-5 shrink-0" />
          <div>
            <p className="text-xs font-medium opacity-80">Code OTP de livraison</p>
            <p className="text-2xl font-bold tracking-widest">{order.otp}</p>
          </div>
        </div>
      )}

      {/* Confirmer OTP livreur */}
      {order.statut === 'en_livraison' && activeRole === 'livreur' && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Entrez le code OTP du client</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={4}
              placeholder="0000"
              className={`w-24 rounded-xl border bg-input px-3 py-2 text-center text-lg font-bold tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${
                otpError ? 'border-destructive' : 'border-border'
              }`}
            />
            <Button
              onClick={handleConfirm}
              className="glass-cta rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <CheckCircle2 className="mr-1.5 size-4" /> Confirmer
            </Button>
          </div>
          {otpError && <p className="mt-1 text-xs text-destructive">Code incorrect, réessayez.</p>}
        </div>
      )}

      {/* Décaisser vendeur */}
      {order.statut === 'livre' && activeRole === 'acheteur' && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-success/10 p-4 text-success">
          <ShieldCheck className="size-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Livraison confirmée !</p>
            <p className="text-xs opacity-80">Vous pouvez décaisser les fonds.</p>
          </div>
          <Button
            onClick={handleDecaisser}
            disabled={decaissing}
            className="glass-cta rounded-xl bg-success px-5 font-semibold text-success-foreground hover:bg-success/90"
          >
            {decaissing ? 'En cours…' : 'Décaisser'}
          </Button>
        </div>
      )}

      {/* Vue lecture pour les rôles non concernés par l'action en cours */}
      {order.statut === 'finance' && activeRole !== 'acheteur' && (
        <div className="mt-4 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          En attente de prise en charge par un livreur.
        </div>
      )}
      {order.statut === 'en_livraison' && activeRole !== 'livreur' && (
        <div className="mt-4 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Livraison en cours.
        </div>
      )}
      {order.statut === 'livre' && activeRole !== 'acheteur' && (
        <div className="mt-4 rounded-2xl bg-success/10 p-4 text-sm text-success">
          Livraison confirmée, en attente de décaissement par l&apos;acheteur.
        </div>
      )}

      {/* Décaissé */}
      {order.statut === 'decaisse' && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-success/10 p-4 text-success">
          <Wallet className="size-5 shrink-0" />
          <p className="text-sm font-semibold">Fonds décaissés avec succès.</p>
        </div>
      )}

      {/* Note livreur */}
      {order.statut === 'decaisse' && !order.note_donnee && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Noter le livreur</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => { setRating(n); rateOrder(order.id) }}
                className={`text-xl transition ${n <= rating ? 'text-yellow-400' : 'text-muted-foreground/40 hover:text-yellow-300'}`}
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              >
                <Star className="size-6" fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
