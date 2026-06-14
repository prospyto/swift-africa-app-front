'use client'

import { useState } from 'react'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  PackageCheck,
  Wallet,
  Star,
  KeyRound,
  CheckCircle2,
  CircleDollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass'
import { useApp, formatXOF } from '@/lib/store'
import type { Order, OrderStatus } from '@/lib/types'

const STEPS: { key: OrderStatus; label: string; icon: typeof Truck }[] = [
  { key: 'en_attente', label: 'En attente', icon: CircleDollarSign },
  { key: 'finance', label: 'Financée', icon: ShieldCheck },
  { key: 'en_livraison', label: 'En livraison', icon: Truck },
  { key: 'decaisse', label: 'Décaissée', icon: Wallet },
]

const ORDER_RANK: Record<OrderStatus, number> = {
  en_attente: 0,
  finance: 1,
  en_livraison: 2,
  livre: 2,
  decaisse: 3,
}

export function Orders() {
  const { orders } = useApp()

  if (orders.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-3 py-10 md:px-6">
        <GlassCard className="flex flex-col items-center gap-3 p-12 text-center">
          <PackageCheck className="size-10 text-muted-foreground/50" />
          <h2 className="text-lg font-bold">Aucune commande pour le moment</h2>
          <p className="text-sm text-muted-foreground">
            Vos achats financés via Escrow apparaîtront ici avec leur code de
            sécurité.
          </p>
        </GlassCard>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-3 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
        Mes commandes
      </h1>
      <div className="grid gap-5">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </section>
  )
}

function OrderCard({ order }: { order: Order }) {
  const { fundOrder, confirmOtp, rateOrder } = useApp()
  const [code, setCode] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [rating, setRating] = useState(0)
  const rank = ORDER_RANK[order.statut]

  function handleConfirm() {
    if (confirmOtp(order.id, code)) {
      setOtpError(false)
    } else {
      setOtpError(true)
    }
  }

  return (
    <GlassCard strong className="p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Commande #{String(order.id).slice(-6)}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
            {order.ville_depart}
            <ArrowRight className="size-4 text-primary" />
            {order.ville_arrivee}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatXOF(order.total)}</p>
          <p className="text-xs text-muted-foreground">
            {order.produits.reduce((s, i) => s + i.quantite, 0)} article(s)
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-5 flex items-center">
        {STEPS.map((step, i) => {
          const done = rank >= i
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-9 items-center justify-center rounded-xl transition ${
                    done
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <step.icon className="size-5" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded-full ${
                    rank > i ? 'bg-success' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Action zone */}
      <div className="mt-5 border-t border-border/60 pt-5">
        {order.statut === 'en_attente' && (
          <Button
            onClick={() => fundOrder(order.id)}
            className="glass-cta h-11 w-full rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Confirmer le paiement Escrow
          </Button>
        )}

        {(order.statut === 'finance' || order.statut === 'en_livraison') && (
          <div className="grid gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-accent p-4">
              <KeyRound className="size-6 text-primary" />
              <div>
                <p className="text-xs text-accent-foreground/80">
                  Votre code de sécurité OTP
                </p>
                <p className="font-mono text-2xl font-bold tracking-[0.4em] text-foreground">
                  {order.otp}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Communiquez ce code au livreur{' '}
              {order.livreur ? `(${order.livreur})` : ''} uniquement à la
              réception. La saisie ci-dessous simule la validation par le
              livreur pour débloquer les fonds.
            </p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                  setOtpError(false)
                }}
                inputMode="numeric"
                placeholder="• • • •"
                className={`w-full rounded-2xl border bg-input px-4 py-3 text-center font-mono text-lg tracking-[0.5em] outline-none focus:ring-2 ${
                  otpError
                    ? 'border-destructive focus:ring-destructive/30'
                    : 'border-border focus:border-primary focus:ring-primary/30'
                }`}
              />
              <Button
                onClick={handleConfirm}
                disabled={code.length !== 4}
                className="glass-cta h-auto rounded-2xl bg-success px-5 font-semibold text-success-foreground hover:bg-success/90"
              >
                Valider
              </Button>
            </div>
            {otpError && (
              <p className="text-xs text-destructive">
                Code incorrect. Vérifiez les 4 chiffres.
              </p>
            )}
          </div>
        )}

        {order.statut === 'decaisse' && (
          <div className="grid gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-success/10 p-4 text-success">
              <CheckCircle2 className="size-5" />
              <span className="text-sm font-semibold">
                Fonds décaissés au vendeur. Livraison confirmée.
              </span>
            </div>
            {order.note_donnee ? (
              <p className="text-center text-sm text-muted-foreground">
                Merci pour votre évaluation.
              </p>
            ) : (
              <div className="text-center">
                <p className="mb-2 text-sm font-medium">
                  Notez le vendeur et le livreur
                </p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      aria-label={`${n} étoiles`}
                    >
                      <Star
                        className={`size-7 transition ${
                          n <= rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => rateOrder(order.id)}
                  disabled={rating === 0}
                  className="glass-cta mt-3 h-10 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Envoyer ma note
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
