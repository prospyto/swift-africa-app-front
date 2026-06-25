'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ShieldCheck, KeyRound, Wallet, LockKeyhole, ShoppingBag, Store, Bike } from 'lucide-react'

const STEPS = [
  {
    icon: LockKeyhole,
    title: "L'acheteur paie",
    desc: "L'argent est débité et placé en sécurité sur un compte tiers. Ni le vendeur ni le livreur n'y touche.",
    color: '#3b82f6',
    who: 'Acheteur',
    whoIcon: ShoppingBag,
  },
  {
    icon: KeyRound,
    title: "Code OTP généré",
    desc: "Un code secret unique est envoyé à l'acheteur. Le vendeur prépare le colis et clique sur \"Prêt\".",
    color: '#ff6b00',
    who: "Acheteur + Vendeur",
    whoIcon: Store,
  },
  {
    icon: ShieldCheck,
    title: "Le livreur livre",
    desc: "Le livreur récupère le colis et le dépose chez l'acheteur. L'acheteur lui donne le code uniquement à la réception.",
    color: '#10b981',
    who: 'Livreur',
    whoIcon: Bike,
  },
  {
    icon: Wallet,
    title: "Tout le monde est payé",
    desc: "Le code validé déclenche le paiement instantané : le vendeur reçoit sa vente, le livreur sa commission. Zéro délai.",
    color: '#8b5cf6',
    who: "Vendeur + Livreur",
    whoIcon: Wallet,
  },
]

function SecurityBadge({ step, number }: {
  step: typeof STEPS[0]
  number: number
}) {
  const [active, setActive] = useState(false)
  const Icon = step.icon

  return (
    <div
      className="relative z-10 flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-300"
      style={{
        backgroundColor: `${step.color}20`,
        border: `3px solid ${step.color}`,
        outline: active ? `4px solid ${step.color}` : '4px solid transparent',
        outlineOffset: '4px',
        transform: active ? 'scale(1.18) rotate(10deg)' : 'scale(1) rotate(0deg)',
        boxShadow: active
          ? `0 0 35px 10px ${step.color}40`
          : `0 8px 24px -4px ${step.color}50`,
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setTimeout(() => setActive(false), 400)}
    >
      {active && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: step.color }}
        />
      )}
      <Icon
        className="relative z-10 size-9 transition-transform duration-300"
        style={{ color: step.color }}
        strokeWidth={1.5}
      />
      <div
        className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full text-xs font-black text-white shadow-md"
        style={{ backgroundColor: step.color }}
      >
        {number}
      </div>
    </div>
  )
}

export function Security() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-5xl">

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
            <ShieldCheck className="size-4" />
            Sécurité
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Chaque acteur est protégé<br />
            <span className="text-[#ff6b00]">à chaque étape</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Le système Escrow garantit que personne ne peut être lésé. L'acheteur ne paie vraiment qu'à la réception, le vendeur est assuré d'être payé, le livreur reçoit sa commission immédiatement.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-blue-200 via-orange-200 via-green-200 to-purple-200 md:left-1/2 md:block" />

          <div className="grid gap-8 md:gap-12">
            {STEPS.map((step, i) => {
              const WhoIcon = step.whoIcon
              return (
                <div
                  key={i}
                  className={`flex items-center gap-6 ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : `translateX(${i % 2 === 0 ? '-40px' : '40px'})`,
                    transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
                  }}
                >
                  <div className={`flex-1 ${i % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div
                      className="rounded-2xl border-2 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      style={{ borderColor: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${step.color}50`)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      {/* Badge acteur concerné */}
                      <div className={`mb-3 flex items-center gap-1.5 ${i % 2 === 1 ? 'md:justify-end' : ''}`}>
                        <div
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                          style={{ backgroundColor: `${step.color}15`, color: step.color }}
                        >
                          <WhoIcon className="size-3" strokeWidth={2} />
                          {step.who}
                        </div>
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                      <p className="leading-relaxed text-gray-600">{step.desc}</p>
                    </div>
                  </div>

                  <SecurityBadge step={step} number={i + 1} />

                  <div className="hidden flex-1 md:block" />
                </div>
              )
            })}
          </div>
        </div>

        {/* Bannière garantie tripartite */}
        <div
          className="mt-16 grid gap-4 sm:grid-cols-3"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 0.7s, transform 0.6s ease 0.7s',
          }}
        >
          {[
            { icon: ShoppingBag, label: 'Acheteur', text: 'Remboursé si non livré', color: '#3b82f6' },
            { icon: Store, label: 'Vendeur', text: 'Payé à chaque livraison confirmée', color: '#ff6b00' },
            { icon: Bike, label: 'Livreur', text: 'Commission immédiate après OTP', color: '#10b981' },
          ].map((g, i) => {
            const Icon = g.icon
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm"
              >
                <div
                  className="flex size-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${g.color}15` }}
                >
                  <Icon className="size-6" style={{ color: g.color }} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-black" style={{ color: g.color }}>{g.label}</p>
                <p className="text-xs leading-snug text-gray-500">{g.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

