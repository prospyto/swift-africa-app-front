'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Store, Truck } from 'lucide-react'
import Link from 'next/link'

const ROLES = [
  {
    icon: ShoppingBag,
    title: 'Acheteur',
    emoji: '🛒',
    color: '#3b82f6',
    bg: '#eff6ff',
    desc: 'Commandez depuis chez vous. Payez sans risque. Recevez ou remboursé.',
    points: [
      'Catalogue de produits variés',
      'Paiement sécurisé par Escrow',
      'Suivi GPS en temps réel',
      'Code OTP pour valider la livraison',
    ],
    cta: 'Je veux acheter',
  },
  {
    icon: Store,
    title: 'Vendeur',
    emoji: '🏪',
    color: '#ff6b00',
    bg: '#fff7ed',
    desc: 'Vendez vos produits à toute l\'Afrique de l\'Ouest. Soyez payé à la livraison confirmée.',
    points: [
      'Boutique en ligne gratuite',
      'Paiement garanti à la livraison',
      'Gestion des commandes simple',
      'Zéro commission les 3 premiers mois',
    ],
    cta: 'Je veux vendre',
    featured: true,
  },
  {
    icon: Truck,
    title: 'Livreur',
    emoji: '🚚',
    color: '#10b981',
    bg: '#ecfdf5',
    desc: 'Acceptez des missions près de chez vous. Gagnez à chaque livraison réussie.',
    points: [
      'Missions géolocalisées',
      'Vous choisissez vos horaires',
      'Paiement immédiat après livraison',
      'GPS intégré pour vous guider',
    ],
    cta: 'Je veux livrer',
  },
]

export function Roles() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div
          className="mb-16 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            Qui sommes-nous ?
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Une plateforme,<br />trois acteurs essentiels
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ROLES.map((role, i) => (
            <div
              key={i}
              style={{
                /* Effet drapeau : chaque carte se déplie de gauche à droite */
                opacity: visible ? 1 : 0,
                transform: visible
                  ? 'scaleX(1) translateX(0)'
                  : 'scaleX(0) translateX(-40px)',
                transformOrigin: 'left center',
                transition: `opacity 0.7s ease ${i * 0.2}s, transform 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) ${i * 0.2}s`,
              }}
            >
              <div
                className={`relative flex h-full flex-col rounded-3xl p-8 ${
                  role.featured
                    ? 'bg-[#ff6b00] text-white shadow-xl shadow-[#ff6b00]/25'
                    : 'bg-white shadow-sm'
                }`}
              >
                {role.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-[#ff6b00] shadow-md">
                    ⭐ Le plus populaire
                  </div>
                )}

                {/* Icône */}
                <div
                  className="mb-5 flex size-16 items-center justify-center rounded-2xl text-3xl"
                  style={{
                    backgroundColor: role.featured ? 'rgba(255,255,255,0.2)' : role.bg,
                  }}
                >
                  {role.emoji}
                </div>

                <h3 className="mb-2 text-2xl font-black">{role.title}</h3>
                <p className={`mb-6 leading-relaxed ${role.featured ? 'text-white/80' : 'text-gray-600'}`}>
                  {role.desc}
                </p>

                <ul className="mb-8 flex-1 space-y-3">
                  {role.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: role.featured ? 'rgba(255,255,255,0.25)' : `${role.color}20`,
                          color: role.featured ? 'white' : role.color,
                        }}
                      >
                        ✓
                      </span>
                      <span className={role.featured ? 'text-white/90' : 'text-gray-700'}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/app"
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all hover:scale-105 ${
                    role.featured
                      ? 'bg-white text-[#ff6b00] hover:bg-gray-50'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={!role.featured ? { backgroundColor: role.color } : {}}
                >
                  {role.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
