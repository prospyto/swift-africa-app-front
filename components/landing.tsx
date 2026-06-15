'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass'
import { ShoppingBag, Truck, Star } from 'lucide-react'

interface LandingProps {
  onEnter: () => void
}

export function Landing({ onEnter }: LandingProps) {
  const [animate, setAnimate] = useState(false)

  // Trigger animations on mount
  if (!animate) {
    setTimeout(() => setAnimate(true), 100)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-12">
      {/* Hero Section */}
      <div
        className={`max-w-2xl mx-auto text-center transition-all duration-700 transform ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-3">
            Swift Africa
          </h1>
          <p className="text-lg sm:text-xl text-foreground/70 font-medium">
            Trust-as-a-Service Marketplace
          </p>
        </div>

        {/* Value Proposition */}
        <p className="text-base sm:text-lg text-foreground/60 mb-12 leading-relaxed">
          Mobilier premium. Logistique sécurisée. Paiements OTP Escrow.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: ShoppingBag,
              title: 'Catalogue Premium',
              desc: 'Meubles haut de gamme',
            },
            {
              icon: Truck,
              title: 'Livraison Sûre',
              desc: 'GPS & Traçabilité',
            },
            {
              icon: Star,
              title: 'Confiance',
              desc: 'OTP Escrow & Notations',
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className={`transition-all duration-700 transform delay-${(i + 1) * 100} ${
                  animate
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <GlassCard className="p-6 text-center h-full">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-foreground/60">{feature.desc}</p>
                </GlassCard>
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <div
          className={`transition-all duration-700 transform delay-500 ${
            animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <button
            onClick={onEnter}
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 glass-cta"
          >
            Commencer →
          </button>
        </div>
      </div>

      {/* Background Accent */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-success/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
