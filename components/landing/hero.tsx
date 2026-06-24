'use client'

import { useEffect, useState, useMemo } from 'react'
import { Truck, LogIn } from 'lucide-react'
import Link from 'next/link'

const WORDS = ['ACHETER', 'VENDEZ', 'LIVREZ']

// Décalage aléatoire (position, rotation) par lettre, calculé une seule
// fois — chaque lettre "explose" dans une direction différente puis se
// reforme à sa place, en boucle infinie (voir .animate-letter en CSS).
function useLetterOffsets(words: string[]) {
  return useMemo(
    () =>
      words.map((word) =>
        word.split('').map(() => ({
          px: `${(Math.random() - 0.5) * 220}px`,
          py: `${(Math.random() - 0.5) * 160}px`,
          pr: `${(Math.random() - 0.5) * 140}deg`,
          delay: `${Math.random() * 0.6}s`,
        })),
      ),
    [words],
  )
}

export function Hero() {
  const [splashDone, setSplashDone] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [wordsVisible, setWordsVisible] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)

  const offsets = useLetterOffsets(WORDS)

  useEffect(() => {
    setTimeout(() => setSplashDone(true), 1800)
    setTimeout(() => setLogoVisible(true), 1900)
    setTimeout(() => setWordsVisible(true), 2200)
    setTimeout(() => setSubtitleVisible(true), 2600)
    setTimeout(() => setCtaVisible(true), 2900)
  }, [])

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
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">

        {/* Fond hero — image plein écran */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-livreur.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Voile sombre pour lisibilité du texte */}
          <div className="absolute inset-0 bg-black/50" />
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
          <span className="text-3xl font-bold tracking-tight text-white">Swift Africa</span>
        </div>

        {/* Mots — chaque lettre se disperse puis se reforme, en boucle infinie */}
        <h1 className="relative z-10 mb-8 flex flex-col items-center gap-1">
          {WORDS.map((word, wi) => (
            <span key={wi} className="block text-6xl font-black tracking-tight text-white md:text-8xl lg:text-9xl">
              {word.split('').map((letter, li) => {
                const o = offsets[wi][li]
                return (
                  <span
                    key={li}
                    className={wordsVisible ? 'animate-letter inline-block' : 'inline-block opacity-0'}
                    style={
                      {
                        '--px': o.px,
                        '--py': o.py,
                        '--pr': o.pr,
                        animationDelay: o.delay,
                      } as React.CSSProperties
                    }
                  >
                    {letter}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>

        {/* Sous-titre */}
        <p
          className="relative z-10 mb-10 max-w-xl text-lg text-white/90 md:text-xl"
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
            className="scanner-btn-dark relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-white/40 px-8 py-4 text-lg font-semibold text-white transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <LogIn className="size-5" />
              Se connecter
            </span>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}
        >
          <div className="flex flex-col items-center gap-1 text-xs text-white/70">
            <span>Découvrir</span>
            <div className="h-6 w-0.5 animate-bounce rounded-full bg-white/40" />
          </div>
        </div>
      </section>
    </>
  )
}
