'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const ROLES = [
  {
    emoji: '🛒',
    title: 'Acheteur',
    color: '#3b82f6',
    bg: '#eff6ff',
    ringColor: 'rgba(59,130,246,0.4)',
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
    emoji: '🏪',
    title: 'Vendeur',
    color: '#ff6b00',
    bg: '#fff7ed',
    ringColor: 'rgba(255,107,0,0.4)',
    desc: "Vendez vos produits à toute l'Afrique de l'Ouest. Soyez payé à la livraison confirmée.",
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
    emoji: '🚚',
    title: 'Livreur',
    color: '#10b981',
    bg: '#ecfdf5',
    ringColor: 'rgba(16,185,129,0.4)',
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
            Une plateforme avec<br />trois acteurs essentiels
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ROLES.map((role, i) => (
            <RoleCard key={i} role={role} i={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RoleCard({ role, i, visible }: { role: typeof ROLES[0]; i: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 400)}
      style={{
        /* Entrée drapeau */
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'scaleX(1) translateX(0) translateY(-8px)' : 'scaleX(1) translateX(0) translateY(0)'
          : 'scaleX(0) translateX(-40px)',
        transformOrigin: 'left center',
        transition: visible
          ? `transform 0.3s ease, box-shadow 0.3s ease, opacity 0.7s ease ${i * 0.2}s`
          : `opacity 0.7s ease ${i * 0.2}s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.2}s`,
        boxShadow: hovered
          ? `0 20px 40px -10px ${role.ringColor}`
          : '0 1px 3px rgba(0,0,0,0.08)',
        borderRadius: '1.5rem',
        cursor: 'pointer',
      }}
    >
      <div
        className={`relative flex h-full flex-col p-8 rounded-3xl ${
          role.featured ? 'text-white' : 'bg-white'
        }`}
        style={role.featured ? { background: 'linear-gradient(135deg, #ff6b00, #ff8c00)' } : {}}
      >
        {role.featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-[#ff6b00] shadow-md">
            ⭐ Le plus populaire
          </div>
        )}

        {/* Badge emoji — contour coloré au hover */}
        <div
          className="mb-5 flex size-16 items-center justify-center rounded-2xl text-3xl transition-all duration-300"
          style={{
            backgroundColor: role.featured ? 'rgba(255,255,255,0.2)' : role.bg,
            outline: hovered ? `3px solid ${role.color}` : '3px solid transparent',
            outlineOffset: '2px',
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
              >✓</span>
              <span className={role.featured ? 'text-white/90' : 'text-gray-700'}>{point}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/app"
          className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all hover:scale-105"
          style={
            role.featured
              ? { backgroundColor: 'white', color: '#ff6b00' }
              : { backgroundColor: role.color, color: 'white' }
          }
        >
          {role.cta} →
        </Link>
      </div>
    </div>
  )
}
