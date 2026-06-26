'use client'

import { useEffect, useRef, useState } from 'react'
import {
  MapPin, Brain, RotateCcw, Warehouse, Mic2, Fingerprint, Sparkles,
} from 'lucide-react'

const FEATURES = [
  {
    icon: MapPin,
    badge: 'Livreur',
    title: 'Livreur en moins de 10 min',
    desc: "Notre algorithme GPS détecte automatiquement les livreurs disponibles près de vous et envoie la mission au plus proche. Zéro attente, zéro friction.",
    color: '#10b981',
    status: 'En développement',
    statusColor: '#10b981',
  },
  {
    icon: Brain,
    badge: 'Acheteur',
    title: 'Un assistant qui veille sur chaque transaction',
    desc: "Swift Africa intègre une IA qui analyse chaque commande en temps réel pour détecter les anomalies et garantir que chaque transaction se passe dans les meilleures conditions.",
    color: '#3b82f6',
    status: 'En développement',
    statusColor: '#8b5cf6',
  },
  {
    icon: Fingerprint,
    badge: 'Livreur',
    title: 'Seul le bon livreur touche votre colis',
    desc: "L'authentification biométrique garantit que votre colis ne peut être récupéré que par le livreur assigné à votre commande. Une couche de sécurité supplémentaire, invisible pour vous.",
    color: '#10b981',
    status: 'Bientôt',
    statusColor: '#3b82f6',
  },
  {
    icon: RotateCcw,
    badge: 'Acheteur',
    title: 'Retours simplifiés, zéro stress',
    desc: "Un produit ne vous convient pas ? Swift Africa gère automatiquement le retour et le remboursement. Pas de négociation, pas d'arnaque — le système s'occupe de tout.",
    color: '#3b82f6',
    status: 'Bientôt',
    statusColor: '#10b981',
  },
  {
    icon: Warehouse,
    badge: 'Vendeur',
    title: 'Vos produits encore plus proches',
    desc: "Des points relais partenaires dans chaque quartier permettront de stocker vos best-sellers à proximité de vos clients. Livraison ultra-rapide, coûts réduits.",
    color: '#ff6b00',
    status: 'Vision 2.0',
    statusColor: '#f59e0b',
  },
  {
    icon: Mic2,
    badge: 'Vendeur',
    title: 'Swift Africa parle votre langue',
    desc: "Interface vocale en Fongbé, Nago et autres langues locales. Parce que la technologie doit être accessible à tous — même sans lire ni écrire.",
    color: '#ff6b00',
    status: 'Vision 2.0',
    statusColor: '#ec4899',
  },
]

export function Roadmap() {
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
    <section ref={ref} className="px-4 py-24">
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
            <Sparkles className="size-4" />
            Vision 2.0
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Ce qui arrive très bientôt
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Swift Africa ne s'arrête pas là. Voici les fonctionnalités en cours de développement
            pour faire de cette plateforme la référence du commerce en Afrique de l'Ouest.
          </p>
        </div>

        {/* Grille features */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={i} feat={feat} i={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feat, i, visible,
}: {
  feat: typeof FEATURES[0]; i: number; visible: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const Icon = feat.icon

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 400)}
      className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? 'translateY(-8px)' : 'translateY(0)'
          : 'translateY(40px)',
        transition: visible
          ? 'transform 0.3s ease, box-shadow 0.3s ease, opacity 0.6s ease'
          : `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
        boxShadow: hovered
          ? `0 20px 40px -12px ${feat.color}30`
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Statut */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: `${feat.statusColor}15`, color: feat.statusColor }}
        >
          {feat.status}
        </span>
        <span className="text-xs font-semibold text-gray-400">{feat.badge}</span>
      </div>

      {/* Icône */}
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-2xl transition-all duration-300"
        style={{
          backgroundColor: `${feat.color}12`,
          transform: hovered ? 'rotate(8deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          boxShadow: hovered ? `0 8px 20px -4px ${feat.color}40` : 'none',
        }}
      >
        <Icon className="size-7" style={{ color: feat.color }} strokeWidth={1.5} />
      </div>

      {/* Texte */}
      <h3 className="mb-2 text-lg font-bold leading-snug">{feat.title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{feat.desc}</p>

      {/* Barre couleur en bas au hover */}
      <div
        className="absolute bottom-0 left-0 h-1 rounded-b-3xl transition-all duration-500"
        style={{
          backgroundColor: feat.color,
          width: hovered ? '100%' : '0%',
        }}
      />
    </div>
  )
}



