'use client'

import { useEffect, useState, useMemo } from 'react'
import { Truck, LogIn } from 'lucide-react'
import Link from 'next/link'

const WORDS = ['ACHETEZ', 'VENDEZ', 'LIVREZ']

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
  const [videoLoaded, setVideoLoaded] = useState(false)

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
        <div className="animate-splash fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
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

      {/* ── PAGE PRINCIPALE — h-screen strict, tout tient dans l'écran ── */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* ── FOND VIDÉO ── */}
        <div className="absolute inset-0 z-0">
          {/* Dégradé fallback */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',
              opacity: videoLoaded ? 0 : 1,
            }}
          />
          <div
            className="absolute -right-32 -top-32 size-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, #ff6b00 0%, transparent 70%)',
              opacity: videoLoaded ? 0 : 0.2,
              transition: 'opacity 1s ease',
            }}
          />
          {/* Vidéo en fond — object-cover remplit sans déborder */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            onCanPlay={() => setVideoLoaded(true)}
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000"
            style={{ opacity: videoLoaded ? 1 : 0 }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Voile dégradé — plus sombre en bas pour les boutons */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </div>

        {/* ── CONTENU — centré verticalement dans h-screen ── */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">

          {/* Logo */}
          <div
            className="mb-5 flex items-center gap-3"
            style={{
              opacity: logoVisible ? 1 : 0,
              transform: logoVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.85)',
              transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/30 md:size-14">
              <span className="animate-truck-roll inline-block">
                <Truck className="size-7 md:size-8" />
              </span>
            </div>
            <span
              className="text-2xl font-bold tracking-tight text-white md:text-3xl"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              Swift Africa
            </span>
          </div>

          {/* Mots animés — taille adaptative qui tient dans l'écran */}
          <h1 className="mb-4 flex flex-col items-center gap-0">
            {WORDS.map((word, wi) => (
              <span
                key={wi}
                className="block font-black tracking-tight text-white"
                style={{
                  fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
                  lineHeight: 1.0,
                  textShadow: '0 4px 24px rgba(0,0,0,0.5)',
                }}
              >
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
            className="mb-6 max-w-lg text-base font-semibold text-white/90 md:text-lg"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              opacity: subtitleVisible ? 1 : 0,
              transform: subtitleVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            Commandez, vendez ou livrez — votre argent est protégé à chaque étape.
            Zéro arnaque. Zéro risque. Paiement libéré seulement à la livraison.
          </p>

          {/* CTA — toujours visibles */}
          <div
            className="flex flex-col items-center gap-3 sm:flex-row"
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <Link
              href="/app"
              className="scanner-btn relative flex items-center gap-2 overflow-hidden rounded-2xl bg-[#ff6b00] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#ff6b00]/40 transition-all hover:scale-105 hover:bg-[#e55f00] md:px-8 md:py-4 md:text-lg"
            >
              <span className="relative z-10">Commencer maintenant →</span>
            </Link>

            <Link
              href="/app"
              className="scanner-btn-dark relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-white/50 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-[#ff6b00] hover:text-[#ff6b00] md:px-8 md:py-4 md:text-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LogIn className="size-4 md:size-5" />
                Se connecter
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator — collé en bas */}
        <div
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}
        >
          <div className="flex flex-col items-center gap-1 text-xs text-white/60">
            <span>Découvrir</span>
            <div className="h-5 w-0.5 animate-bounce rounded-full bg-white/40" />
          </div>
        </div>
      </section>
    </>
  )
}

