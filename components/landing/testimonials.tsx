'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Store, Bike, Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Aminata K.',
    role: 'Acheteur',
    city: 'Cotonou',
    icon: ShoppingBag,
    color: '#3b82f6',
    stars: 5,
    text: "J'avais peur de payer en ligne — trop d'arnaques. Avec Swift Africa, mon argent était bloqué jusqu'à ce que je reçoive mon colis. J'ai enfin pu commander sans stress.",
  },
  {
    name: 'Kofi M.',
    role: 'Vendeur',
    city: 'Porto-Novo',
    icon: Store,
    color: '#ff6b00',
    stars: 5,
    text: "Avant, mes clients payaient à la livraison et parfois refusaient le colis. Maintenant ils paient à l'avance et l'argent m'est garanti. Mes ventes ont doublé en un mois.",
  },
  {
    name: 'Roméo D.',
    role: 'Livreur',
    city: 'Abomey-Calavi',
    icon: Bike,
    color: '#10b981',
    stars: 5,
    text: "Je reçois ma commission dès que le code est validé — pas d'attente, pas de dispute avec le vendeur. Je fais 4 à 6 livraisons par jour et je gère mon temps comme je veux.",
  },
  {
    name: 'Fatou B.',
    role: 'Vendeur',
    city: 'Lomé',
    icon: Store,
    color: '#ff6b00',
    stars: 5,
    text: "En 3 minutes j'avais ma boutique en ligne. Je vends mes pagnes et mes bijoux à des clients que je n'aurais jamais pu toucher avant. Swift Africa a changé mon business.",
  },
  {
    name: 'Sékou T.',
    role: 'Acheteur',
    city: 'Parakou',
    icon: ShoppingBag,
    color: '#3b82f6',
    stars: 5,
    text: "Le livreur était là en moins de 15 minutes. J'ai donné le code, il est parti. Simple, rapide, sécurisé. Je recommande à toute ma famille.",
  },
  {
    name: 'Blessing O.',
    role: 'Livreur',
    city: 'Cotonou',
    icon: Bike,
    color: '#10b981',
    stars: 5,
    text: "L'application me donne le GPS directement. Je n'ai plus à appeler le vendeur pour trouver l'adresse. Et dès que je livre, l'argent est là. C'est professionnel.",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-4 fill-[#f59e0b] text-[#f59e0b]" />
      ))}
    </div>
  )
}

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div
          className="mb-16 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            <Quote className="size-4" />
            Témoignages
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Ils ont essayé Swift Africa
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Acheteurs, vendeurs et livreurs — voici ce qu'ils en pensent.
          </p>
        </div>

        {/* Grille */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => {
            const Icon = t.icon
            return (
              <div
                key={i}
                className="group relative flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s, box-shadow 0.3s ease`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 40px -12px ${t.color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                {/* Guillemet décoratif */}
                <Quote
                  className="absolute right-5 top-5 size-8 opacity-8 transition-opacity duration-300 group-hover:opacity-15"
                  style={{ color: t.color }}
                />

                {/* Header card */}
                <div className="mb-4 flex items-center gap-3">
                  {/* Avatar icône */}
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ backgroundColor: `${t.color}15` }}
                  >
                    <Icon className="size-6" style={{ color: t.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-bold leading-tight">{t.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: `${t.color}15`, color: t.color }}
                      >
                        {t.role}
                      </span>
                      <span className="text-xs text-gray-400">{t.city}</span>
                    </div>
                  </div>
                </div>

                {/* Étoiles */}
                <div className="mb-3">
                  <Stars count={t.stars} />
                </div>

                {/* Texte */}
                <p className="flex-1 text-sm leading-relaxed text-gray-600">
                  "{t.text}"
                </p>

                {/* Barre couleur au bas au hover */}
                <div
                  className="absolute bottom-0 left-0 h-1 rounded-b-3xl transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: t.color, width: '0%' }}
                />
              </div>
            )
          })}
        </div>

        {/* Résumé étoiles global */}
        <div
          className="mt-12 flex flex-col items-center gap-3"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.7s',
          }}
        >
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-6 fill-[#f59e0b] text-[#f59e0b]" />
            ))}
          </div>
          <p className="text-sm font-semibold text-gray-600">
            5/5 — Note moyenne de nos bêta-testeurs
          </p>
        </div>
      </div>
    </section>
  )
}
