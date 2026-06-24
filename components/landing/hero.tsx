'use client'

import { useEffect, useState } from 'react'
import { Truck, LogIn } from 'lucide-react'
import Link from 'next/link'

const WORDS = ['ACHETER', 'VENDEZ', 'LIVREZ']
const COLORS = ['#111827', '#ff6b00', '#111827']

// Chaque mot tombe d'en haut, s'écrase légèrement au sol (scaleY réduit),
// puis se relève à sa taille normale — un seul mot à la fois, en cascade.
function useDropWords(words: string[], started: boolean) {
  const [stage, setStage] = useState<('hidden' | 'falling' | 'landed' | 'settled')[]>(
    words.map(() => 'hidden'),
  )

  useEffect(() => {
    if (!started) return
    words.forEach((_, i) => {
      const base = i * 550
      setTimeout(() => setStage((p) => p.map((s, j) => (j === i ? 'falling' : s))), base)
      setTimeout(() => setStage((p) => p.map((s, j) => (j === i ? 'landed' : s))), base + 450)
      setTimeout(() => setStage((p) => p.map((s, j) => (j === i ? 'settled' : s))), base + 600)
    })
  }, [started])

  return stage
}

export function Hero() {
  const [splashDone, setSplashDone] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [typingStarted, setTypingStarted] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    // Splash disparaît après 1.8s
    setTimeout(() => setSplashDone(true), 1800)
    // Logo
    setTimeout(() => setLogoVisible(true), 1900)
    // Chute des mots
    setTimeout(() => setTypingStarted(true), 2200)
    // Sous-titre et CTA — la chute des 3 mots dure environ 1.7s au total
    setTimeout(() => setSubtitleVisible(true), 3900)
    setTimeout(() => setCtaVisible(true), 4200)
  }, [])

  const stages = useDropWords(WORDS, typingStarted)

  return (
    <>
      {/* ── SPLASH SCREEN ── */}
      {!splashDone && (
        <div
          className="animate-splash fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <div className="flex size-24 items-center justify-center rounded-3xl bg-[#ff6b00] text-white shadow-2xl shadow-[#ff6b00]/40">
            <Truck className="size-14" />
          </div>
          <p className="mt-6 text-2xl font-black tracking-tight text-gray-900">Swift Africa</p>
          <p className="mt-2 text-sm text-gray-400">Chargement…</p>
          <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#ff6b00]"
              style={{ animation: 'scanner 1.6s ease-in-out infinite' }}
            />
          </div>
        </div>
      )}

      {/* ── PAGE PRINCIPALE ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 text-center lg:flex-row lg:gap-12 lg:px-12 lg:text-left">

        <div className="flex flex-col items-center lg:items-start">
          {/* Logo */}
          <div
            className="relative z-10 mb-10 flex items-center gap-3"
            style={{
              opacity: logoVisible ? 1 : 0,
              transform: logoVisible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.8)',
              transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/30">
              <span className="animate-truck-roll inline-block">
                <Truck className="size-9" />
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight">Swift Africa</span>
          </div>

          {/* Mots — chacun tombe, s'écrase au sol puis se relève */}
          <h1 className="relative z-10 mb-8 flex flex-col items-center gap-1 lg:items-start">
            {WORDS.map((word, i) => {
              const stage = stages[i]
              const hidden = stage === 'hidden'
              const falling = stage === 'falling'
              const landed = stage === 'landed'
              return (
                <span
                  key={i}
                  className="block text-6xl font-black tracking-tight md:text-8xl lg:text-7xl"
                  style={{
                    color: COLORS[i],
                    minHeight: '1.15em',
                    display: 'inline-block',
                    opacity: hidden ? 0 : 1,
                    transform: hidden
                      ? 'translateY(-120%)'
                      : landed
                        ? 'translateY(0) scaleY(0.7) scaleX(1.08)'
                        : 'translateY(0) scaleY(1) scaleX(1)',
                    transformOrigin: 'bottom center',
                    transition: falling
                      ? 'transform 0.45s cubic-bezier(0.55,0,1,0.45), opacity 0.1s ease'
                      : 'transform 0.18s ease-out',
                  }}
                >
                  {word}
                </span>
              )
            })}
          </h1>

          {/* Sous-titre */}
          <p
            className="relative z-10 mb-10 max-w-xl text-lg text-gray-600 md:text-xl"
            style={{
              opacity: subtitleVisible ? 1 : 0,
              transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            La plateforme de commerce sécurisé pour l'Afrique de l'Ouest.
            Paiement bloqué jusqu'à la livraison. Zéro arnaque.
          </p>

          {/* CTA — deux boutons avec scanner, sans trait séparateur */}
          <div
            className="relative z-10 flex flex-col items-center gap-4 sm:flex-row"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <Link
              href="/app"
              className="scanner-btn relative flex items-center gap-3 overflow-hidden rounded-2xl bg-[#ff6b00] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#ff6b00]/30 transition-all hover:scale-105 hover:bg-[#e55f00]"
            >
              <span className="relative z-10 flex items-center gap-3">
                Commencer maintenant →
              </span>
            </Link>

            <Link
              href="/app"
              className="scanner-btn-dark relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LogIn className="size-5" />
                Se connecter
              </span>
            </Link>
          </div>
        </div>

        {/* Illustration mascotte */}
        <div
          className="relative z-10 mt-12 w-full max-w-sm lg:mt-0 lg:max-w-md"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.92)',
            transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <img
            src="/hero-livreur.png"
            alt="Livreur Swift Africa sur scooter, colis à l'arrière"
            className="w-full rounded-[2.5rem] shadow-2xl shadow-[#ff6b00]/30"
          />
        </div>

        {/* Scroll indicator — sans trait */}
        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}
        >
          <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
            <span>Découvrir</span>
            <div className="h-6 w-0.5 animate-bounce rounded-full bg-gray-200" />
          </div>
        </div>
      </section>
    </>
  )
}
