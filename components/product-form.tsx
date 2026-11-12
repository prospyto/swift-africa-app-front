'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, Upload, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, Spinner } from '@/components/glass'
import { multipartFetch } from '@/lib/api-multipart'
import { ApiError, OfflineError } from '@/lib/api'
import { useApp } from '@/lib/store'
import { apiFetch } from '@/lib/api'
import type { Product, Allee } from '@/lib/types'

interface ProductFormProps {
  product?: Product
  /** allée présélectionnée à l'ajout d'un nouveau produit */
  defaultAllee?: number | null
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, defaultAllee, onSuccess, onCancel }: ProductFormProps) {
  const { waking } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [preview, setPreview] = useState<string>(product?.image || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nom: product?.nom || '',
    description: product?.description || '',
    prix: product?.prix ? String(product.prix) : '',
    prix_solde: product?.prix_solde ? String(product.prix_solde) : '',
    categorie: product?.categorie || '',
    ville: product?.ville || '',
    adresse_point_vente: (product as any)?.adresse_point_vente || '',
    allee: product?.allee ? String(product.allee) : defaultAllee ? String(defaultAllee) : '',
    // vide = stock non suivi ; 1 = pièce unique
    stock: product?.stock != null ? String(product.stock) : '',
  })
  const [allees, setAllees] = useState<Allee[]>([])

  useEffect(() => {
    apiFetch<Allee[]>('allees/').then(setAllees).catch(() => setAllees([]))
  }, [])

  const [image, setImage] = useState<File | null>(null)

  const categories = [
    'Mode & Vêtements',
    'Électronique',
    'Alimentation',
    'Maison & Meuble',
    'Beauté & Cosmétique',
    'Agriculture',
    'Artisanat',
    'Services',
    'Autre',
  ]

  const villesParPays: { pays: string; villes: string[] }[] = [
    {
      pays: 'Bénin',
      villes: [
        'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Abomey-Calavi',
        'Kétou', 'Bohicon', 'Natitingou', 'Ouidah', 'Djougou',
        'Lokossa', 'Pobè', 'Savalou', 'Comè',
      ],
    },
    {
      pays: 'Régional (CEDEAO)',
      villes: ['Dakar', 'Abidjan', 'Bamako', 'Niamey', 'Lomé', 'Accra', 'Lagos'],
    },
  ]

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
      formData.append('allee', form.allee) // vide = aucune allée
      formData.append('stock', form.stock) // vide = stock non suivi
      if (product?.brouillon) formData.append('brouillon', 'false') // publication

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

      setShowSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof OfflineError) {
        setError('Le serveur ne répond pas. Vérifiez votre connexion et réessayez.')
      } else {
        setError('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 md:px-6 md:py-8">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ff6b00]/10">
              <CheckCircle2 className="size-9 text-[#ff6b00]" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {product?.brouillon ? 'Produit publié' : product ? 'Produit mis à jour' : 'Produit ajouté'}
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              {product && !product.brouillon
                ? 'Vos modifications ont bien été enregistrées.'
                : 'Votre produit est maintenant visible dans le catalogue.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccess(false)
                onSuccess()
              }}
              className="w-full rounded-2xl bg-[#ff6b00] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e55f00]"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

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
              className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
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
              className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Allée & Stock */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="produit-allee" className="mb-2 block text-sm font-medium">
                Allée de la boutique
              </label>
              <select
                id="produit-allee"
                value={form.allee}
                onChange={(e) => setForm({ ...form, allee: e.target.value })}
                className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Aucune</option>
                {allees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                  </option>
                ))}
              </select>
              {allees.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Créez vos allées dans « Ma boutique ».
                </p>
              )}
            </div>
            <div>
              <label htmlFor="produit-stock" className="mb-2 block text-sm font-medium">
                Quantité en stock
              </label>
              <input
                id="produit-stock"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="Laisser vide = illimité"
                className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, stock: '1' })}
                className="mt-1 text-xs text-primary hover:underline"
              >
                Pièce unique (1 seul exemplaire)
              </button>
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
                className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-xl border border-foreground/30 bg-white/90 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Sélectionner...</option>
                {villesParPays.map((group) => (
                  <optgroup key={group.pays} label={group.pays}>
                    {group.villes.map((ville) => (
                      <option key={ville} value={ville}>
                        {ville}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

        {/* Adresse du point de vente */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <MapPin className="size-4 text-[#ff6b00]" />
            Adresse du point de vente
          </label>
          <input
            type="text"
            name="point-de-vente-adresse"
            autoComplete="off"
            value={form.adresse_point_vente}
            onChange={(e) => setForm({ ...form, adresse_point_vente: e.target.value })}
            placeholder="Ex: Quartier Gbèdjromèdé, rue 15, Cotonou"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition"
          />
          <p className="mt-1 text-xs text-gray-400">
            Où le livreur viendra récupérer la commande
          </p>
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
                  <Spinner /> {waking ? 'Réveil du serveur…' : 'Enregistrement…'}
                </span>
              ) : product ? (
                'Mettre à jour'
              ) : (
                'Créer le produit'
              )}
            </Button>
          </div>

          {loading && waking && (
            <p className="text-center text-xs text-gray-400">
              Le serveur était en veille, ça peut prendre jusqu'à 30 secondes. Merci de patienter.
            </p>
          )}
        </form>
      </GlassCard>
    </div>
  )
}

