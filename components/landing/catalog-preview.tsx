'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=85',
    label: 'Électronique',
    color: '#3b82f6',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
    label: 'Mode & Vêtements',
    color: '#ec4899',
  },
  {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=85',
    label: 'Alimentation',
    color: '#10b981',
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=85',
    label: 'Maison & Décoration',
    color: '#f59e0b',
  },
  {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=85',
    label: 'Beauté & Cosmétiques',
    color: '#8b5cf6',
  },
  {
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=85',
    label: 'Bricolage & Outillage',
    color: '#ff6b00',
  },
]

export function CatalogPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length)
  }, [])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (!visible) return
    autoRef.current = setInterval(next, 3500)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [visible, next])

  const pause = () => { if (autoRef.current) clearInterval(autoRef.current) }
  const resume = () => { autoRef.current = setInterval(next, 3500) }

  return (
    <section
      ref={ref}
      className="bg-white py-16"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      <div className="mx-auto max-w-5xl px-4">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            Catalogue
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Tout ce que vous pouvez<br />
            <span className="text-[#ff6b00]">acheter sur Swift Africa</span>
          </h2>
        </div>

        {/* Carousel — images plein cadre */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          style={{ height: '480px' }}
        >
          {/* Images */}
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: current === i ? 1 : 0, zIndex: current === i ? 1 : 0 }}
            >
              <Image
                src={slide.image}
                alt={slide.label}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                priority={i === 0}
              />
              {/* Gradient bas pour le label */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Label catégorie */}
              <div className="absolute bottom-6 left-6">
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-bold text-white"
                  style={{ backgroundColor: slide.color }}
                >
                  {slide.label}
                </span>
              </div>
            </div>
          ))}

          {/* Flèche gauche */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white"
          >
            <ChevronLeft className="size-5 text-gray-800" />
          </button>

          {/* Flèche droite */}
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white"
          >
            <ChevronRight className="size-5 text-gray-800" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 right-6 z-10 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300"
                style={{
                  width: current === i ? '1.5rem' : '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: current === i ? 'white' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/app"
            className="scanner-btn relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-[#ff6b00] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#ff6b00]/30 transition hover:scale-105 hover:bg-[#e55f00]"
          >
            <span className="relative z-10">Voir tous les produits →</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
