'use client'

import { useCallback, useEffect, useState } from 'react'
import { Layers, Plus, Trash2, Pencil, AlertCircle } from 'lucide-react'
import { GlassCard, Spinner } from '@/components/glass'
import { Button } from '@/components/ui/button'
import { apiFetch, ApiError } from '@/lib/api'
import type { Allee } from '@/lib/types'

const champ =
  'w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

function messageErreur(e: unknown) {
  return e instanceof ApiError ? e.message : "Impossible d'enregistrer. Réessayez."
}

/** Espace vendeur : les allées (rayons) de la boutique. Les réglages sont dans ⚙ Paramètres. */
export function ShopManager({
  nbAComplete,
  onChanged,
  onAddToAllee,
}: {
  /** produits sans description ou sans allée, pour rappeler au vendeur de les compléter */
  nbAComplete: number
  onChanged: () => void
  /** raccourci : ajouter un produit directement dans cette allée */
  onAddToAllee?: (alleeId: number) => void
}) {
  const [allees, setAllees] = useState<Allee[] | null>(null)
  const [nouvelle, setNouvelle] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const charger = useCallback(async () => {
    try {
      setAllees(await apiFetch<Allee[]>('allees/'))
    } catch {
      setAllees([])
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  async function ajouterAllee() {
    if (!nouvelle.trim()) return
    setErreur(null)
    try {
      await apiFetch('allees/', { method: 'POST', body: { nom: nouvelle.trim() } })
      setNouvelle('')
      charger()
    } catch (e) {
      setErreur(messageErreur(e))
    }
  }

  async function renommer(a: Allee) {
    const n = window.prompt("Nouveau nom de l'allée", a.nom)
    if (!n || !n.trim() || n.trim() === a.nom) return
    setErreur(null)
    try {
      await apiFetch(`allees/${a.id}/`, { method: 'PATCH', body: { nom: n.trim() } })
      charger()
      onChanged()
    } catch (e) {
      setErreur(messageErreur(e))
    }
  }

  async function supprimer(a: Allee) {
    const suite =
      a.nb_produits > 0
        ? ` Ses ${a.nb_produits} produit(s) restent en ligne, simplement sans allée.`
        : ''
    if (!window.confirm(`Supprimer l'allée « ${a.nom} » ?${suite}`)) return
    try {
      await apiFetch(`allees/${a.id}/`, { method: 'DELETE' })
      charger()
      onChanged()
    } catch (e) {
      setErreur(messageErreur(e))
    }
  }

  if (allees === null) {
    return (
      <GlassCard strong className="flex justify-center p-6">
        <Spinner className="size-5 text-primary" />
      </GlassCard>
    )
  }

  return (
    <GlassCard strong className="p-5 md:p-6">
      <div className="mb-1 flex items-center gap-2">
        <Layers className="size-5 text-primary" />
        <h2 className="font-bold">Mes allées</h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Les allées rangent vos produits (ex. « Pagnes », « Bijoux »). Vos clients les voient dans votre boutique.
      </p>

      {nbAComplete > 0 && (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {nbAComplete} produit{nbAComplete > 1 ? 's' : ''} à compléter : ajoutez une description et
          rangez-{nbAComplete > 1 ? 'les' : 'le'} dans une allée pour mieux vendre.
        </p>
      )}

      <ul className="mb-3 flex flex-wrap gap-2">
        {allees.map((a) => (
          <li key={a.id} className="glass flex items-center gap-1 rounded-full py-1 pl-3 pr-1.5 text-sm">
            <span>
              {a.nom} <span className="text-xs text-muted-foreground">({a.nb_produits})</span>
            </span>
            {onAddToAllee && (
              <button onClick={() => onAddToAllee(a.id)} aria-label={`Ajouter un produit dans ${a.nom}`} className="rounded-full p-1 text-primary hover:bg-primary/10">
                <Plus className="size-3.5" />
              </button>
            )}
            <button onClick={() => renommer(a)} aria-label={`Renommer ${a.nom}`} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
              <Pencil className="size-3.5" />
            </button>
            <button onClick={() => supprimer(a)} aria-label={`Supprimer ${a.nom}`} className="rounded-full p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
        {allees.length === 0 && <li className="text-xs text-muted-foreground">Aucune allée pour l'instant.</li>}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          ajouterAllee()
        }}
        className="flex gap-2"
      >
        <input
          value={nouvelle}
          onChange={(e) => setNouvelle(e.target.value)}
          maxLength={80}
          placeholder="Nouvelle allée…"
          aria-label="Nom de la nouvelle allée"
          className={champ}
        />
        <Button type="submit" className="rounded-2xl bg-primary px-4 text-primary-foreground hover:bg-primary/90" aria-label="Ajouter l'allée">
          <Plus className="size-4" />
        </Button>
      </form>

      {erreur && <p className="mt-3 text-sm text-destructive">{erreur}</p>}
    </GlassCard>
  )
}
