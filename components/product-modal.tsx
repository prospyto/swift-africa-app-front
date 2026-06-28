'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, MapPin, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import Image from 'next/image'
import { formatXOF } from '@/lib/store'
import type { Product } from '@/lib/types'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onAddCart: (p: Product) => void
  inCart: boolean
}

export function ProductModal({ product, onClose, onAddCart, inCart }: ProductModalProps) {
  const [currentImg, setCurrentImg] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setCurrentImg(0)
    setAdded(false)
  }, [product])

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!product) return null

  // Construire la liste d'images
  const images: string[] = []
  if (product.image_url) images.push(product.image_url)
  if (product.image && product.image !== product.image_url) images.push(product.image)
  if (images.length === 0) images.push('/placeholder.svg')

  const onSale = product.prix_solde != null && product.prix_solde < product.prix

  function handleAdd() {
    onAddCart(product!)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl max-h-[95vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition"
        >
          <X className="size-5" />
        </button>

        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-gray-100 shrink-0">
          <Image
            src={images[currentImg]}
            alt={product.nom}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />

          {/* Navigation images */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImg((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => setCurrentImg((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentImg ? '20px' : '6px',
                      backgroundColor: i === currentImg ? '#ff6b00' : 'rgba(255,255,255,0.6)',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge solde */}
          {onSale && (
            <span className="absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
              Solde
            </span>
          )}
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-7">
            {/* Titre & catégorie */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="text-xl md:text-2xl font-black leading-snug">{product.nom}</h2>
              <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                {product.categorie}
              </span>
            </div>

            {/* Vendeur & Ville */}
            <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="size-4 shrink-0" />
              <span>{product.vendeur} · {product.ville}</span>
            </div>

            {/* Description COMPLÈTE avec scroll */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Description</p>
              <div className="max-h-48 overflow-y-auto rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                  {product.description || 'Aucune description disponible.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fixe — Prix + CTA */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 md:px-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Prix</p>
            {onSale ? (
              <>
                <p className="text-xl font-black text-green-600">
                  {formatXOF(product.prix_solde as number)}
                </p>
                <p className="text-xs text-gray-400 line-through">{formatXOF(product.prix)}</p>
              </>
            ) : (
              <p className="text-xl font-black text-gray-900">{formatXOF(product.prix)}</p>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
            style={{
              backgroundColor: added ? '#10b981' : inCart ? '#f59e0b' : '#ff6b00',
            }}
          >
            {added ? (
              <><Check className="size-4" /> Ajouté !</>
            ) : inCart ? (
              <><ShoppingCart className="size-4" /> Encore</>
            ) : (
              <><ShoppingCart className="size-4" /> Ajouter</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
