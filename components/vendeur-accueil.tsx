'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Banknote, ClipboardList, ImageIcon, PackageX, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { apiFetch } from '@/lib/api'
import { useApp, formatXOF } from '@/lib/store'
import type { Product } from '@/lib/types'

function Tuile({
  icon: Icon, valeur, libelle, onClick, alerte,
}: { icon: LucideIcon; valeur: string; libelle: string; onClick?: () => void; alerte?: boolean }) {
  const contenu = (
    <>
      <Icon className={`size-5 ${alerte ? 'text-amber-600' : 'text-primary'}`} />
      <span className="mt-2 block text-2xl font-bold tracking-tight">{valeur}</span>
      <span className="block text-xs text-muted-foreground">{libelle}</span>
    </>
  )
  return onClick ? (
    <button onClick={onClick} className="glass-strong rounded-3xl p-4 text-left transition hover:-translate-y-0.5">
      {contenu}
    </button>
  ) : (
    <div className="glass-strong rounded-3xl p-4">{contenu}</div>
  )
}

/** Accueil du vendeur : ce qui demande son attention aujourd'hui. */
export function VendeurAccueil({ onTab }: { onTab: (id: string) => void }) {
  const { orders, user } = useApp()
  const [produits, setProduits] = useState<Product[] | null>(null)

  useEffect(() => {
    apiFetch<Product[]>('produits/?mine=1')
      .then(setProduits)
      .catch(() => setProduits([]))
  }, [])

  // Une commande = une boutique : la part du vendeur = total - livraison, moins 3 %
  const partVendeur = (total: number, frais?: number) => Math.round((total - (frais ?? 0)) * 0.97)
  const aPayer = orders.filter((o) => o.statut === 'en_attente').length
  const enCours = orders.filter((o) => o.statut === 'finance' || o.statut === 'en_livraison').length
  const encaisse = orders
    .filter((o) => o.statut === 'decaisse')
    .reduce((s, o) => s + partVendeur(o.total, o.frais_livraison), 0)

  const brouillons = (produits ?? []).filter((p) => p.brouillon).length
  const publies = (produits ?? []).filter((p) => !p.brouillon)
  const epuises = publies.filter((p) => p.stock === 0).length
  const aCompleter = publies.filter((p) => !p.description?.trim() || !p.allee).length

  const alertes: string[] = []
  if (epuises > 0) alertes.push(`${epuises} produit${epuises > 1 ? 's' : ''} épuisé${epuises > 1 ? 's' : ''} : remettez du stock`)
  if (brouillons > 0) alertes.push(`${brouillons} brouillon${brouillons > 1 ? 's' : ''} à compléter pour être publié${brouillons > 1 ? 's' : ''}`)
  if (aCompleter > 0) alertes.push(`${aCompleter} produit${aCompleter > 1 ? 's' : ''} sans description ou sans allée`)

  return (
    <section className="mx-auto grid max-w-3xl gap-5 px-3 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bonjour{user?.prenom ? `, ${user.prenom}` : ''}</h1>
        <p className="text-sm text-muted-foreground">Voici l'état de votre boutique.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tuile icon={ClipboardList} valeur={String(aPayer)} libelle="en attente de paiement" onClick={() => onTab('commandes')} />
        <Tuile icon={Truck} valeur={String(enCours)} libelle="commandes en cours" onClick={() => onTab('commandes')} />
        <Tuile icon={Banknote} valeur={formatXOF(encaisse)} libelle="déjà encaissé (après 3 %)" onClick={() => onTab('espace')} />
        <Tuile icon={PackageX} valeur={String(epuises)} libelle="produits épuisés" alerte={epuises > 0} onClick={() => onTab('espace')} />
      </div>

      {alertes.length > 0 && (
        <GlassCard className="p-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
            <AlertCircle className="size-4 text-amber-600" /> À faire
          </h2>
          <ul className="grid gap-1.5 text-sm text-muted-foreground">
            {alertes.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onTab('espace')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm"
        >
          <ImageIcon className="size-4" /> Ajouter des produits
        </button>
        <button
          onClick={() => onTab('commandes')}
          className="glass flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          <ClipboardList className="size-4" /> Commandes reçues
        </button>
      </div>
    </section>
  )
}
