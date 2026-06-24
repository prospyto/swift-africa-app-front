'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, Spinner } from '@/components/glass'
import { multipartFetch } from '@/lib/api-multipart'
import { ApiError } from '@/lib/api'
import type { Product } from '@/lib/types'

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string>(product?.image || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nom: product?.nom || '',
    description: product?.description || '',
    prix: product?.prix ? String(product.prix) : '',
    prix_solde: product?.prix_solde ? String(product.prix_solde) : '',
    categorie: product?.categorie || '',
    ville: product?.ville || '',
  })

  const [image, setImage] = useState<File | null>(null)

  const categories = [
    'Salon',
    'Chambre',
    'Cuisine',
    'Bureau',
    'Salle à manger',
    'Enfant',
  ]
  const villes = ['Dakar', 'Abidjan', 'Bamako', 'Niamey', 'Lomé', 'Cotonou']

  function handleImageSelect(file: File | null) {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 MB')
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nom || !form.prix || !form.categorie || !form.ville) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (parseFloat(form.prix) <= 0) {
      setError('Le prix doit être supérieur à 0')
      return
    }

    if (!product && !image) {
      setError('Veuillez sélectionner une image')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('nom', form.nom)
      formData.append('description', form.description)
      formData.append('prix', form.prix)
      if (form.prix_solde) formData.append('prix_solde', form.prix_solde)
      formData.append('categorie', form.categorie)
      formData.append('ville', form.ville)

      if (image) {
        formData.append('image', image)
      }

      let result

      if (product) {
        // Édition
        result = await multipartFetch(`produits/${product.id}/`, {
          method: 'PATCH',
          body: formData,
        })
      } else {
        // Création
        result = await multipartFetch('produits/', {
          method: 'POST',
          body: formData,
        })
      }

      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 md:px-6 md:py-8">
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Retour
      </button>

      <GlassCard strong className="p-6 md:p-8">
        <h1 className="mb-6 text-2xl font-bold">
          {product ? 'Éditer le produit' : 'Ajouter un produit'}
        </h1>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Photo du produit *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageSelect(e.target.files?.[0] || null)
              }
              className="hidden"
            />

            {preview ? (
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={preview}
                  alt="Prévisualisation"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="glass flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 transition hover:border-primary hover:bg-primary/5"
            >
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {preview ? 'Changer l\'image' : 'Sélectionner une image'}
              </span>
            </button>
          </div>

          {/* Nom */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nom du produit *
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex: Canapé 3 places"
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Décrivez votre produit..."
              rows={3}
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Prix & Solde */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Prix normal (FCFA) *
              </label>
              <input
                type="number"
                value={form.prix}
                onChange={(e) => setForm({ ...form, prix: e.target.value })}
                placeholder="0"
                min="0"
                step="100"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Prix solde (FCFA)
              </label>
              <input
                type="number"
                value={form.prix_solde}
                onChange={(e) =>
                  setForm({ ...form, prix_solde: e.target.value })
                }
                placeholder="0"
                min="0"
                step="100"
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Catégorie & Ville */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="produit-categorie" className="mb-2 block text-sm font-medium">
                Catégorie *
              </label>
              <select
                id="produit-categorie"
                value={form.categorie}
                onChange={(e) =>
                  setForm({ ...form, categorie: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Sélectionner...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="produit-ville" className="mb-2 block text-sm font-medium">
                Ville *
              </label>
              <select
                id="produit-ville"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Sélectionner...</option>
                {villes.map((ville) => (
                  <option key={ville} value={ville}>
                    {ville}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-border px-4 py-3 font-medium transition hover:bg-secondary"
            >
              Annuler
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="glass-cta flex-1 rounded-2xl bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Enregistrement…
                </span>
              ) : product ? (
                'Mettre à jour'
              ) : (
                'Créer le produit'
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
