'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/glass'
import { useApp, formatXOF } from '@/lib/store'
import { useToast } from '@/components/toast'

const VILLES = ['Dakar', 'Abidjan', 'Bamako', 'Niamey', 'Lomé', 'Cotonou']

export function CartDrawer({
  open,
  onClose,
  onOrdered,
}: {
  open: boolean
  onClose: () => void
  onOrdered: () => void
}) {
  const { cart, updateQty, removeFromCart, cartTotal, checkout } = useApp()
  const { toast } = useToast()
  const [depart, setDepart] = useState('Dakar')
  const [arrivee, setArrivee] = useState('Abidjan')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (cart.length === 0 || loading) return
    setLoading(true)
    try {
      await checkout(depart, arrivee)
      toast('Commande passée avec succès ! 🎉', 'success')
      onOrdered()
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la commande'
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="glass-strong m-3 flex h-[calc(100%-1.5rem)] flex-col rounded-3xl">
          <div className="flex items-center justify-between border-b border-border/60 p-5">
            <h2 className="text-lg font-bold">Votre panier</h2>
            <button
              onClick={onClose}
              className="glass flex size-9 items-center justify-center rounded-xl"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <ShieldCheck className="mb-3 size-10 opacity-40" />
                <p>Votre panier est vide.</p>
              </div>
            ) : (
              <ul className="grid gap-3">
                {cart.map((item) => {
                  const price = item.product.prix_solde ?? item.product.prix
                  return (
                    <li
                      key={item.product.id}
                      className="glass flex gap-3 rounded-2xl p-3"
                    >
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        <Image
                          src={item.product.image || '/placeholder.svg'}
                          alt={item.product.nom}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">
                            {item.product.nom}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Retirer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-primary">
                          {formatXOF(price)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQty(item.product.id, item.quantite - 1)
                            }
                            className="glass flex size-7 items-center justify-center rounded-lg"
                            aria-label="Diminuer"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantite}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.product.id, item.quantite + 1)
                            }
                            className="glass flex size-7 items-center justify-center rounded-lg"
                            aria-label="Augmenter"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-border/60 p-5">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <SelectVille
                  label="Départ"
                  value={depart}
                  onChange={setDepart}
                />
                <SelectVille
                  label="Arrivée"
                  value={arrivee}
                  onChange={setArrivee}
                />
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold">
                  {formatXOF(cartTotal)}
                </span>
              </div>

              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-success/10 p-3 text-xs text-success">
                <ShieldCheck className="size-4 shrink-0" />
                <span>
                  Paiement sécurisé par Escrow. Un code OTP à 4 chiffres sera
                  généré pour valider la livraison.
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="glass-cta h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Financement…
                  </span>
                ) : (
                  'Financer la commande'
                )}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function SelectVille({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        {VILLES.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </div>
  )
}
