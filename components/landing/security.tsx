'use client'

import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, KeyRound, Wallet, Lock } from 'lucide-react'

const ACTORS = [
  {
    emoji: '🛒',
    title: 'Acheteur',
    color: '#3b82f6',
    bg: '#eff6ff',
    points: [
      'Votre argent est bloqué dès le paiement',
      'Vous recevez un code OTP secret',
      'Vous donnez le code uniquement à la réception',
      'Remboursé si la livraison échoue',
    ],
  },
  {
    emoji: '🏪',
    title: 'Vendeur',
    color: '#ff6b00',
    bg: '#fff7ed',
    points: [
      'Vous êtes payé seulement après livraison confirmée',
      'Zéro risque d\'impayé',
      'Transparence totale sur chaque commande',
      'Votre réputation est protégée',
    ],
  },
  {
    emoji: '🚚',
    title: 'Livreur',
    color: '#10b981',
    bg: '#ecfdf5',
    points: [
      'Vous collectez le code OTP du client',
      'Paiement instantané après validation',
      'GPS intégré pour trouver l\'adresse',
      'Chaque mission est tracée et sécurisée',
    ],
  },
]

const STEPS = [
  { icon: Lock,        title: 'Paiement bloqué',     desc: 'L\'acheteur paie — l\'argent est mis en sécurité. Personne n\'y touche.', color: '#3b82f6' },
  { icon: KeyRound,    title: 'Code OTP généré',      desc: 'Un code secret à 4 chiffres est remis à l\'acheteur uniquement.', color: '#ff6b00' },
  { icon: ShieldCheck, title: 'Livraison confirmée',  desc: 'L\'acheteur donne le code au livreur quand il reçoit son colis.', color: '#10b981' },
  { icon: Wallet,      title: 'Vendeur payé',         desc: 'Seulement après confirmation, le vendeur reçoit son argent.', color: '#8b5cf6' },
]

export function Security() {
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
      <div className="mx-auto max-w-5xl">

        {/* Header — même style que Roles */}
        <div
          className="mb-16 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
            🔒 Sécurité
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Votre argent ne bouge pas<br />
            <span className="text-[#ff6b00]">sans votre accord</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Le système Escrow protège chaque acteur — acheteur, vendeur et livreur. Tout le monde est gagnant.
          </p>
        </div>

        {/* 3 acteurs — même style que Roles */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {ACTORS.map((actor, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scaleX(1) translateX(0)' : 'scaleX(0) translateX(-40px)',
                transformOrigin: 'left center',
                transition: `opacity 0.7s ease ${i * 0.2}s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.2}s`,
              }}
            >
              <div
                className="mb-4 flex size-14 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: actor.bg }}
              >
                {actor.emoji}
              </div>
              <h3 className="mb-3 text-lg font-black">{actor.title}</h3>
              <ul className="space-y-2">
                {actor.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                    <span
                      className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: actor.color }}
                    >✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Timeline 4 étapes */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.5s ease ${0.6 + i * 0.1}s, transform 0.5s ease ${0.6 + i * 0.1}s`,
              }}
            >
              <div
                className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <step.icon className="size-5" style={{ color: step.color }} />
              </div>
              <p className="mb-1 text-sm font-bold">{step.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Bannière garantie */}
        <div
          className="rounded-3xl bg-gradient-to-r from-[#ff6b00] to-[#ff8c00] p-8 text-center text-white shadow-xl shadow-[#ff6b00]/20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 1s, transform 0.6s ease 1s',
          }}
        >
          <ShieldCheck className="mx-auto mb-3 size-10 opacity-90" />
          <h3 className="mb-2 text-2xl font-black">Garantie Swift Africa</h3>
          <p className="text-white/85">
            Si vous ne recevez pas votre commande, votre argent vous est remboursé intégralement. Toujours.
          </p>
        </div>
      </div>
    </section>
  )
}
