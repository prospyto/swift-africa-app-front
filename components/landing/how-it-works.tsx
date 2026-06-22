'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, ShieldCheck, PackageCheck } from 'lucide-react'

const STEPS = [
  {
    icon: ShoppingCart,
    number: '01',
    title: 'Choisissez un produit',
    desc: 'Parcourez le catalogue et passez commande en quelques secondes depuis votre téléphone.',
    color: '#ff6b00',
  },
  {
    icon: ShieldCheck,
    number: '02',
    title: 'Payez en sécurité',
    desc: 'Votre argent est bloqué jusqu\'à la réception. Personne ne touche à rien avant vous.',
    color: '#10b981',
  },
  {
    icon: PackageCheck,
    number: '03',
    title: 'Recevez et confirmez',
    desc: 'Donnez le code OTP au livreur uniquement quand vous avez votre colis. Alors seulement le vendeur est payé.',
    color: '#3b82f6',
  },
]

export function HowItWorks() {
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
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            Comment ça marche
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Simple comme bonjour
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
              }}
            >
              <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                {/* Numéro */}
                <span className="absolute right-6 top-6 text-6xl font-black text-gray-100">
                  {step.number}
                </span>
                {/* Icône */}
                <div
                  className="mb-5 flex size-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon className="size-7" style={{ color: step.color }} />
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>

                {/* Connecteur */}
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#ff6b00] text-white text-xs font-bold shadow-md">
                      →
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
