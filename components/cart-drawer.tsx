'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/glass'
import { useApp, formatXOF } from '@/lib/store'
import { useToast } from '@/components/toast'

const VILLES = [
  'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Parakou',
  'Dakar', 'Abidjan', 'Bamako', 'Niamey', 'Lomé',
]

export function CartDrawer({
  open,
  onClose,
  onOrdered,
  guest = false,
  onLoginRequired,
}: {
  open: boolean
  onClose: () => void
  onOrdered: () => void
  /** Visiteur non connecté : le panier reste utilisable, la commande demande un compte. */
  guest?: boolean
  onLoginRequired?: () => void
}) {
  const { cart, updateQty, removeFromCart, cartTotal, checkout } = useApp()
  const { toast } = useToast()
  const [adresseLivraison, setAdresseLivraison] = useState('')
  const [ville, setVille] = useState(VILLES[0])
  const [etiquette, setEtiquette] = useState('')
  const [loading, setLoading] = useState(false)

  // panier rangé par boutique (une commande par boutique)
  const parBoutique = [...cart].sort((a, b) =>
    String(a.product.vendeur_id ?? a.product.vendeur).localeCompare(String(b.product.vendeur_id ?? b.product.vendeur)),
  )
  const nbBoutiques = new Set(cart.map((i) => i.product.vendeur_id ?? i.product.vendeur)).size

  async function handleCheckout() {
    if (cart.length === 0 || loading) return
    if (!adresseLivraison.trim()) {
      toast('Veuillez entrer votre adresse de livraison.', 'error')
      return
    }
    setLoading(true)
    try {
      const crees = await checkout(adresseLivraison.trim(), ville, etiquette)
      setEtiquette('')
      toast(
        crees.length > 1 ? `${crees.length} commandes passées (une par boutique) ! 🎉` : 'Commande passée avec succès ! 🎉',
        'success',
      )
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
                {parBoutique.map((item, idx) => {
                  const price = item.product.prix_solde ?? item.product.prix
                  const cle = item.product.vendeur_id ?? item.product.vendeur
                  const precedent = parBoutique[idx - 1]
                  const nouvelleBoutique =
                    idx === 0 || (precedent.product.vendeur_id ?? precedent.product.vendeur) !== cle
                  return (
                    <Fragment key={item.product.id}>
                    {nouvelleBoutique && (
                      <li className="px-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.product.vendeur || 'Boutique'}
                      </li>
                    )}
                    <li
                      className="glass flex gap-3 rounded-2xl p-3"
                    >
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        <Image
                          src={item.product.image_url || item.product.image || '/placeholder.svg'}
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
                    </Fragment>
                  )
                })}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-border/60 p-5">
              {!guest && (
              <div className="mb-4 grid gap-3">
                <div>
                  <label htmlFor="commande-etiquette" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    🏷️ Nom de la commande <span className="font-normal text-gray-400">(facultatif)</span>
                  </label>
                  <input
                    id="commande-etiquette"
                    type="text"
                    maxLength={60}
                    value={etiquette}
                    onChange={(e) => setEtiquette(e.target.value)}
                    placeholder="Ex: Cadeau maman, Tabaski…"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition"
                  />
                </div>
                <SelectVille label="🏙️ Ville de livraison" value={ville} onChange={setVille} />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    📍 Adresse de livraison
                  </label>
                  <input
                    type="text"
                    value={adresseLivraison}
                    onChange={(e) => setAdresseLivraison(e.target.value)}
                    placeholder="Ex: Quartier Akpakpa, rue 12, Cotonou"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Soyez précis — le livreur utilisera cette adresse
                  </p>
                </div>
              </div>
              )}

              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Produits</span>
                <span className="text-xl font-bold">
                  {formatXOF(cartTotal)}
                </span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                + livraison, calculée selon la ville.
                {nbBoutiques > 1 && ` Vous avez ${nbBoutiques} boutiques : une commande (et une livraison) par boutique.`}
              </p>

              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-success/10 p-3 text-xs text-success">
                <ShieldCheck className="size-4 shrink-0" />
                <span>
                  Paiement sécurisé par Escrow. Un code OTP à 4 chiffres sera
                  généré pour valider la livraison.
                </span>
              </div>

              {guest ? (
                <Button
                  onClick={() => { onClose(); onLoginRequired?.() }}
                  className="glass-cta h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Se connecter pour commander
                </Button>
              ) : (
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="glass-cta h-12 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Envoi…
                  </span>
                ) : (
                  nbBoutiques > 1 ? `Passer ${nbBoutiques} commandes` : 'Passer la commande'
                )}
              </Button>
              )}
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
      <label htmlFor={`ville-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={`ville-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        name={`ville-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-foreground/30 bg-white/90 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
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


