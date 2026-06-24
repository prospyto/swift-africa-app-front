'use client'

import { useEffect, useRef, useState } from 'react'
import { Gift, ShieldCheck, Globe, Zap } from 'lucide-react'

const STATS = [
  { target: 0,   suffix: '',     label: "Frais d'inscription",      display: 'Gratuit', color: '#ff6b00', icon: Gift },
  { target: 100, suffix: '%',    label: 'Livraisons sécurisées OTP', color: '#10b981', icon: ShieldCheck },
  { target: 3,   suffix: ' pays',label: 'Au lancement',             color: '#3b82f6', icon: Globe },
  { target: 60,  suffix: 's',    label: 'Pour passer une commande', color: '#8b5cf6', icon: Zap },
]

function CountUp({ target, suffix, display, color, started }: {
  target: number; suffix: string; display?: string; color: string; started: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started || display || target === 0) return
    const duration = 1500
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target, display])

  return (
    <div
      className="text-4xl font-black md:text-5xl break-words"
      style={{ color }}
    >
      {display ?? `${started ? count : 0}${suffix}`}
    </div>
  )
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div
          className="mb-16 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            Chiffres clés
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Swift Africa en chiffres
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="group flex flex-col items-center rounded-3xl bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
              }}
            >
              <div
                className="mb-3 flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="size-6" style={{ color: stat.color }} strokeWidth={1.5} />
              </div>
              <CountUp
                target={stat.target}
                suffix={stat.suffix}
                display={stat.display}
                color={stat.color}
                started={visible}
              />
              <p className="mt-2 text-xs leading-snug text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
