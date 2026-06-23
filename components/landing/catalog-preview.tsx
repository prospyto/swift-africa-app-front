'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  {
    label: 'Électronique',
    emoji: '📱',
    color: '#3b82f6',
    bg: '#eff6ff',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
    desc: 'Smartphones, laptops, accessoires',
  },
  {
    label: 'Mode & Vêtements',
    emoji: '👗',
    color: '#ec4899',
    bg: '#fdf2f8',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    desc: 'Tenues, chaussures, accessoires',
  },
  {
    label: 'Alimentation',
    emoji: '🛒',
    color: '#10b981',
    bg: '#ecfdf5',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    desc: 'Produits frais, épicerie, boissons',
  },
  {
    label: 'Maison & Décoration',
    emoji: '🏠',
    color: '#f59e0b',
    bg: '#fffbeb',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    desc: 'Meubles, déco, électroménager',
  },
  {
    label: 'Beauté & Cosmétiques',
    emoji: '💄',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    desc: 'Soins, parfums, maquillage',
  },
  {
    label: 'Bricolage & Outillage',
    emoji: '🔧',
    color: '#ff6b00',
    bg: '#fff7ed',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
    desc: 'Outils, matériaux, équipements',
  },
]

export function CatalogPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  // Lazy load — section visible au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((index: number) => {
    const total = CATEGORIES.length
    setCurrent((index + total) % total)
  }, [])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // Auto-défilement toutes les 3s
  useEffect(() => {
    if (!visible) return
    autoRef.current = setInterval(next, 3000)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [visible, next])

  // Pause au survol
  const pauseAuto = () => { if (autoRef.current) clearInterval(autoRef.current) }
  const resumeAuto = () => { autoRef.current = setInterval(next, 3000) }

  return (
    <section
      ref={ref}
      className="overflow-hidden bg-white px-4 py-20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            Catalogue
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Tout ce que vous pouvez<br />
            <span className="text-[#ff6b00]">acheter sur Swift Africa</span>
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={pauseAuto}
          onMouseLeave={resumeAuto}
          onTouchStart={pauseAuto}
          onTouchEnd={resumeAuto}
        >
          {/* Carte principale */}
          <div className="overflow-hidden rounded-3xl">
            <div
              ref={trackRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {CATEGORIES.map((cat, i) => (
                <div key={i} className="w-full shrink-0">
                  <div className="relative flex h-[420px] md:h-[500px] w-full flex-col md:flex-row overflow-hidden rounded-3xl">

                    {/* Image */}
                    <div className="relative h-56 w-full md:h-full md:w-3/5">
                      <Image
                        src={cat.image}
                        alt={cat.label}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 md:bg-gradient-to-l" />
                    </div>

                    {/* Contenu */}
                    <div
                      className="flex flex-col justify-center p-8 md:w-2/5"
                      style={{ backgroundColor: cat.bg }}
                    >
                      <div
                        className="mb-4 flex size-16 items-center justify-center rounded-2xl text-4xl shadow-sm"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {cat.emoji}
                      </div>
                      <h3
                        className="mb-2 text-2xl font-black"
                        style={{ color: cat.color }}
                      >
                        {cat.label}
                      </h3>
                      <p className="mb-6 text-gray-600">{cat.desc}</p>
                      <Link
                        href="/app"
                        className="wave-btn relative inline-flex items-center gap-2 overflow-hidden rounded-2xl px-6 py-3 text-sm font-bold text-white transition hover:scale-105"
                        style={{ backgroundColor: cat.color }}
                      >
                        <span className="relative z-10">Explorer →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flèche gauche */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white"
          >
            <ChevronLeft className="size-5 text-gray-700" />
          </button>

          {/* Flèche droite */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white"
          >
            <ChevronRight className="size-5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {CATEGORIES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300"
                style={{
                  width: current === i ? '2rem' : '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: current === i ? '#ff6b00' : '#d1d5db',
                }}
              />
            ))}
          </div>
        </div>

        {/* Miniatures catégories */}
        <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200"
              style={{
                backgroundColor: current === i ? cat.bg : 'transparent',
                outline: current === i ? `2px solid ${cat.color}` : '2px solid transparent',
              }}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-600 leading-tight text-center">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
