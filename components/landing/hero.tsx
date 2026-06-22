'use client'

import { useEffect, useState } from 'react'
import { Truck, LogIn } from 'lucide-react'
import Link from 'next/link'

const WORDS = ['ACHETER', 'VENDEZ', 'LIVREZ']
const COLORS = ['#111827', '#ff6b00', '#111827']

function useTypewriter(words: string[], started: boolean) {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState<string[]>(['', '', ''])
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!started || done) return
    let wi = 0
    let li = 0

    const type = () => {
      if (wi >= words.length) { setDone(true); return }
      const word = words[wi]
      if (li <= word.length) {
        setDisplayed(prev => {
          const next = [...prev]
          next[wi] = word.slice(0, li)
          return next
        })
        li++
        setTimeout(type, 60)
      } else {
        wi++
        li = 0
        setTimeout(type, 300)
      }
    }
    type()
  }, [started])

  return displayed
}

export function Hero() {
  const [logoVisible, setLogoVisible] = useState(false)
  const [typingStarted, setTypingStarted] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    // Logo apparaît immédiatement
    setLogoVisible(true)
    // Écriture commence après 400ms
    setTimeout(() => setTypingStarted(true), 400)
    // Sous-titre après écriture complète (~400 + 3 mots * ~500ms)
    setTimeout(() => setSubtitleVisible(true), 2400)
    setTimeout(() => setCtaVisible(true), 2700)
  }, [])

  const displayed = useTypewriter(WORDS, typingStarted)

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">

      {/* ∞ animé en arrière-plan */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <svg
          viewBox="0 0 400 200"
          className="w-[90vw] max-w-3xl opacity-10"
          style={{ animation: 'infinity-spin 8s linear infinite' }}
        >
          <defs>
            <linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b00" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ff6b00" />
            </linearGradient>
          </defs>
          {/* Symbole infini dessiné à la main en SVG path */}
          <path
            d="M200,100 C200,55 235,30 270,30 C320,30 360,65 360,100 C360,135 320,170 270,170 C235,170 200,145 200,100 C200,55 165,30 130,30 C80,30 40,65 40,100 C40,135 80,170 130,170 C165,170 200,145 200,100 Z"
            fill="none"
            stroke="url(#infGrad)"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>
        {/* Lueur douce */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b00]/8 blur-3xl" />
      </div>

      {/* Logo — apparaît EN PREMIER */}
      <div
        className="mb-10 flex items-center gap-3"
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

      {/* Mots — écriture lettre par lettre, chacun sur sa ligne */}
      <h1 className="mb-8 flex flex-col items-center gap-1">
        {WORDS.map((word, i) => (
          <span
            key={i}
            className="block text-6xl font-black tracking-tight md:text-8xl lg:text-9xl"
            style={{ color: COLORS[i], minHeight: '1.1em' }}
          >
            {displayed[i]}
            {/* Curseur clignotant sur le mot en cours d'écriture */}
            {typingStarted && displayed[i].length < word.length && (
              <span className="animate-pulse text-[#ff6b00]">|</span>
            )}
          </span>
        ))}
      </h1>

      {/* Sous-titre */}
      <p
        className="mb-10 max-w-xl text-lg text-gray-600 md:text-xl"
        style={{
          opacity: subtitleVisible ? 1 : 0,
          transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        La plateforme de commerce sécurisé pour l'Afrique de l'Ouest.
        Paiement bloqué jusqu'à la livraison. Zéro arnaque.
      </p>

      {/* CTA — bouton avec effet scanner */}
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
          className="scanner-btn relative flex items-center gap-3 overflow-hidden rounded-2xl bg-[#ff6b00] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#ff6b00]/30 transition-all hover:scale-105 hover:bg-[#e55f00]"
        >
          <span className="relative z-10 flex items-center gap-3">
            Commencer maintenant
            <span>→</span>
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
