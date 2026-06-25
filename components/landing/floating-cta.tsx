'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export function FloatingCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <Link
        href="/app"
        className="flex items-center gap-2 rounded-2xl bg-[#ff6b00] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#ff6b00]/40 transition hover:bg-[#e55f00] hover:scale-105"
      >
        <Zap className="size-4 fill-white" />
        Commencer maintenant
      </Link>
    </div>
  )
}
