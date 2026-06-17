'use client'

import { useState } from 'react'
import { Plus, X, Loader } from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { apiFetch, isOfflineError } from '@/lib/api'
import { useApp } from '@/lib/store'

export function AddProductForm({
  onProductAdded,
}: {
  onProductAdded?: () => void
}) {
  const { user } = useApp()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    prix_solde: '',
    categorie: '',
    image: '',
  })

  const categories = [
    'Canapés',
    'Tables',
    'Chaises',
    'Lits',
    'Armoires',
    'Étagères',
    'Bureaux',
    'Décoration',
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.nom || !formData.prix || !formData.categorie) {
        setError('Veuillez remplir les champs obligatoires')
        setLoading(false)
        return
      }

      // Parse price
      const prix = parseFloat(formData.prix)
      const prix_solde = formData.prix_solde ? parseFloat(formData.prix_solde) : null

      if (prix <= 0) {
        setError('Le prix doit être > 0')
        setLoading(false)
        return
      }

      // Call API
      const response = await apiFetch('/produits/', {
        method: 'POST',
        body: {
          nom: formData.nom,
          description: formData.description,
          prix,
          prix_solde,
          categorie: formData.categorie,
          image: formData.image || '/placeholder.svg',
          vendeur_id: user?.id,
        },
      })

      console.log('[v0] Product created:', response)

      // Reset form
      setFormData({
        nom: '',
        description: '',
        prix: '',
        prix_solde: '',
        categorie: '',
        image: '',
      })
      setOpen(false)

      // Refresh products
      onProductAdded?.()
    } catch (err) {
      if (isOfflineError(err)) {
        setError('Mode démo: produit ajouté localement')
      } else {
        setError((err as Error).message || 'Erreur lors de la création')
      }
      console.log('[v0] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition"
      >
        <Plus className="size-4" />
        Ajouter produit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <GlassCard strong className="w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Ajouter un produit</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Canapé convertible"
                  className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails du produit..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Prix solde (optionnel)
                  </label>
                  <input
                    type="number"
                    value={formData.prix_solde}
                    onChange={(e) => setFormData({ ...formData, prix_solde: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Catégorie *
                </label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">-- Sélectionner --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  URL Image
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 font-semibold text-muted-foreground hover:bg-muted transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="size-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Créer
                    </>
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </>
  )
}
