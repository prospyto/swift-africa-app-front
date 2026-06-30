'use client'

import { useState, useEffect } from 'react'
import { Truck, Menu, X } from 'lucide-react'
import Link from 'next/link'

const LINKS = [
  { label: 'Qui sommes-nous', href: '#roles' },
  { label: 'Comment ça marche', href: '#how' },
  { label: 'Sécurité', href: '#security' },
  { label: 'Partenariat', href: '#partenariat' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
          boxShadow: scrolled ? '0 4px 24px -8px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#ff6b00] text-white shadow-sm shadow-[#ff6b00]/30">
              <Truck className="size-5" />
            </div>
            <span
              className="text-lg font-black tracking-tight transition-colors"
              style={{ color: scrolled ? '#111827' : 'white' }}
            >
              Swift Africa
            </span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-[#ff6b00]"
                style={{ color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA desktop */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/app"
              className="text-sm font-semibold transition-colors hover:text-[#ff6b00]"
              style={{ color: scrolled ? '#374151' : 'rgba(255,255,255,0.85)' }}
            >
              Se connecter
            </Link>
            <Link
              href="/app"
              className="rounded-xl bg-[#ff6b00] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-[#ff6b00]/30 transition hover:bg-[#e55f00] hover:scale-105"
            >
              Commencer
            </Link>
          </div>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-xl transition md:hidden"
            style={{
              backgroundColor: scrolled ? '#f3f4f6' : 'rgba(255,255,255,0.15)',
              color: scrolled ? '#111827' : 'white',
            }}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile dépliable */}
      <div
        className="fixed inset-x-0 top-[57px] z-30 bg-white shadow-xl transition-all duration-300 md:hidden"
        style={{
          maxHeight: menuOpen ? '400px' : '0',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-[#ff6b00]/10 hover:text-[#ff6b00]"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
            <Link
              href="/app"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition hover:border-[#ff6b00] hover:text-[#ff6b00]"
            >
              Se connecter
            </Link>
            <Link
              href="/app"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-[#ff6b00] py-3 text-center text-sm font-bold text-white transition hover:bg-[#e55f00]"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay fermeture menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
