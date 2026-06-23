'use client'

import { useEffect, useState } from 'react'
import { Truck, LogIn } from 'lucide-react'
import Link from 'next/link'

const WORDS = ['ACHETER', 'VENDEZ', 'LIVREZ']
const COLORS = ['#111827', '#ff6b00', '#111827']

function useTypewriter(words: string[], started: boolean) {
  const [displayed, setDisplayed] = useState<string[]>(['', '', ''])

  useEffect(() => {
    if (!started) return
    let wi = 0
    let li = 0

    const type = () => {
      if (wi >= words.length) return
      const word = words[wi]
      if (li <= word.length) {
        const currentWi = wi
        const currentLi = li
        setDisplayed(prev => {
          const next = [...prev]
          next[currentWi] = word.slice(0, currentLi)
          return next
        })
        li++
        setTimeout(type, 60)
      } else {
        wi++
        li = 0
        setTimeout(type, 250)
      }
    }
    type()
  }, [started])

  return displayed
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
    // Écriture
    setTimeout(() => setTypingStarted(true), 2200)
    // Sous-titre et CTA
    setTimeout(() => setSubtitleVisible(true), 4400)
    setTimeout(() => setCtaVisible(true), 4700)
  }, [])

  const displayed = useTypewriter(WORDS, typingStarted)

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
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">

        {/* ∞ fond visible + deux orbes flottants orange/bleu */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 500 250"
            className="w-[100vw] max-w-5xl"
            style={{ animation: 'infinity-spin 10s linear infinite' }}
          >
            <defs>
              <linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.35" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M250,125 C250,70 292,38 338,38 C400,38 450,81 450,125 C450,169 400,212 338,212 C292,212 250,180 250,125 C250,70 208,38 162,38 C100,38 50,81 50,125 C50,169 100,212 162,212 C208,212 250,180 250,125 Z"
              fill="none"
              stroke="url(#infGrad)"
              strokeWidth="28"
              strokeLinecap="round"
              filter="url(#glow)"
            />
          </svg>
          <div className="animate-blob-a absolute left-1/2 top-1/3 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff6b00]/25 blur-3xl" />
          <div className="animate-blob-b absolute bottom-0 right-0 h-[550px] w-[550px] rounded-full bg-blue-500/20 blur-3xl" />
        </div>

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

        {/* Mots — écriture lettre par lettre, sans curseur */}
        <h1 className="relative z-10 mb-8 flex flex-col items-center gap-1">
          {WORDS.map((_, i) => (
            <span
              key={i}
              className="block text-6xl font-black tracking-tight md:text-8xl lg:text-9xl"
              style={{ color: COLORS[i], minHeight: '1.15em' }}
            >
              {displayed[i]}&nbsp;
            </span>
          ))}
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
