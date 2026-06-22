'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ShieldCheck, KeyRound, Wallet, Lock } from 'lucide-react'

const STEPS = [
  {
    icon: Lock,
    title: 'Vous payez',
    desc: 'Votre argent est débité et placé en sécurité. Ni le vendeur ni le livreur n\'y touche.',
    color: '#3b82f6',
  },
  {
    icon: KeyRound,
    title: 'Code OTP généré',
    desc: 'Un code secret à 4 chiffres vous est remis. Gardez-le jusqu\'à la réception.',
    color: '#ff6b00',
  },
  {
    icon: ShieldCheck,
    title: 'Livraison confirmée',
    desc: 'Vous donnez le code au livreur uniquement quand vous avez votre colis en main.',
    color: '#10b981',
  },
  {
    icon: Wallet,
    title: 'Vendeur payé',
    desc: 'Seulement après votre confirmation, le vendeur reçoit son argent. Zéro risque pour vous.',
    color: '#8b5cf6',
  },
]

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
            Le système Escrow bloque votre paiement jusqu'à la confirmation de livraison. C'est la première plateforme en Afrique de l'Ouest à offrir cette garantie.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Ligne de connexion */}
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-blue-200 via-orange-200 via-green-200 to-purple-200 md:left-1/2 md:block" />

          <div className="grid gap-8 md:gap-12">
            {STEPS.map((step, i) => (
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
                  <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${i % 2 === 1 ? 'md:ml-auto' : ''}`}>
                    <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Icône centrale */}
                <div
                  className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full shadow-lg"
                  style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}40` }}
                >
                  <step.icon className="size-7" style={{ color: step.color }} />
                  <div
                    className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Bannière garantie */}
        <div
          className="mt-16 rounded-3xl bg-gradient-to-r from-[#ff6b00] to-[#ff8c00] p-8 text-center text-white shadow-xl shadow-[#ff6b00]/20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
            transition: 'opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s',
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

function SecurityBadge({ step, number }: { step: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; title: string }; number: number }) {
  const [active, setActive] = useState(false)
  return (
    <div
      className="relative z-10 flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-full shadow-xl transition-all duration-300"
      style={{
        backgroundColor: `${step.color}20`,
        border: `3px solid ${step.color}50`,
        outline: active ? `4px solid ${step.color}` : '4px solid transparent',
        outlineOffset: '3px',
        transform: active ? 'scale(1.15) rotate(8deg)' : 'scale(1) rotate(0deg)',
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setTimeout(() => setActive(false), 400)}
    >
      <step.icon className="size-9 transition-transform duration-300" style={{ color: step.color }} />
      <div
        className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full text-xs font-black text-white shadow-md"
        style={{ backgroundColor: step.color }}
      >
        {number}
      </div>
    </div>
  )
}
