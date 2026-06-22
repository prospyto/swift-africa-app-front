'use client'

import { useEffect, useState } from 'react'
import { Truck, LogIn } from 'lucide-react'
import Link from 'next/link'

const WORDS = [
  { text: 'Achetez,',  color: 'inherit',   delay: 0,    floatClass: 'animate-float' },
  { text: 'Vendez,',   color: '#ff6b00',   delay: 350,  floatClass: 'animate-float-delay-1' },
  { text: 'ou Livrez.', color: 'inherit',  delay: 700,  floatClass: 'animate-float-delay-2' },
]

export function Hero() {
  const [visibleWords, setVisibleWords] = useState<number[]>([])
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    WORDS.forEach((_, i) => {
      setTimeout(() => {
        setVisibleWords((prev) => [...prev, i])
      }, 300 + i * 350)
    })
    setTimeout(() => setSubtitleVisible(true), 300 + WORDS.length * 350 + 200)
    setTimeout(() => setCtaVisible(true), 300 + WORDS.length * 350 + 500)
  }, [])

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Fond animé */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b00]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#ff6b00]/5 blur-3xl" />
      </div>

      {/* Logo — Truck en mouvement permanent */}
      <div
        className="mb-8 flex items-center gap-3"
        style={{
          opacity: visibleWords.length > 0 ? 1 : 0,
          transform: visibleWords.length > 0 ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/30">
          <span className="animate-truck-roll inline-block">
            <Truck className="size-8" />
          </span>
        </div>
        <span className="text-2xl font-bold tracking-tight">Swift Africa</span>
      </div>

      {/* Slogan — pop puis flottement eau */}
      <h1 className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
        {WORDS.map((word, i) => {
          const popped = visibleWords.includes(i)
          return (
            <span
              key={i}
              className={popped ? word.floatClass : ''}
              style={{
                opacity: popped ? 1 : 0,
                transform: popped ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(30px)',
                transition: popped
                  ? 'opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'
                  : 'none',
                color: word.color,
                display: 'inline-block',
              }}
            >
              {word.text}
            </span>
          )
        })}
      </h1>

      {/* Sous-titre */}
      <p
        className="mb-10 max-w-2xl text-lg text-gray-600 md:text-xl"
        style={{
          opacity: subtitleVisible ? 1 : 0,
          transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        La plateforme de commerce sécurisé pour l'Afrique de l'Ouest.
        Paiement bloqué jusqu'à la livraison. Zéro arnaque.
      </p>

      {/* CTA */}
      <div
        className="flex flex-col items-center gap-4 sm:flex-row"
        style={{
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <Link
          href="/app"
          className="group flex items-center gap-3 rounded-2xl bg-[#ff6b00] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#ff6b00]/30 transition-all hover:scale-105 hover:bg-[#e55f00]"
        >
          Commencer maintenant
          {/* Flèche qui pulse en permanence */}
          <span className="animate-arrow-pulse inline-block">
            →
          </span>
        </Link>
        <Link
          href="/app"
          className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
        >
          <LogIn className="size-5" />
          Se connecter
        </Link>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{
          opacity: ctaVisible ? 1 : 0,
          transition: 'opacity 0.6s ease 0.3s',
        }}
      >
        <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
          <span>Découvrir</span>
          <div className="h-8 w-0.5 animate-bounce rounded-full bg-gray-300" />
        </div>
      </div>
    </section>
  )
}
