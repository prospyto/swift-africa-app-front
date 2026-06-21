'use client'

import { useEffect, useState, useRef } from 'react'
import { Truck, ShoppingCart, LogOut, WifiOff, Loader2, Bell, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { apiFetch } from '@/lib/api'

interface Tab {
  id: string
  label: string
}

interface NavbarProps {
  tab: string
  onTab: (t: string) => void
  onOpenCart: () => void
  tabs: Tab[]
}

interface ConvResume {
  commande_id: number
  non_lus: number
  dernier_message: string
  dernier_auteur: string
}

export function Navbar({ tab, onTab, onOpenCart, tabs }: NavbarProps) {
  const { user, logout, cartCount, offline, waking, mode, availableRoles, setMode } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [nonLus, setNonLus] = useState(0)
  const [convs, setConvs] = useState<ConvResume[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  // Fetch non-lus toutes les 15s
  useEffect(() => {
    if (!user) return
    async function fetchNonLus() {
      try {
        const data = await apiFetch<{ non_lus: number; conversations?: ConvResume[] }>('chat/non-lus/')
        setNonLus(data.non_lus)
        if (data.conversations) setConvs(data.conversations)
      } catch {
        // silencieux
      }
    }
    fetchNonLus()
    const interval = setInterval(fetchNonLus, 15_000)
    return () => clearInterval(interval)
  }, [user])

  // Fermer le panel si clic dehors
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [notifOpen])

  if (!user) return null

  const activeRole = mode || user.role

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="glass-strong mx-auto flex max-w-7xl items-center gap-3 rounded-3xl px-4 py-3 md:px-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="glass-cta flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="size-5" />
          </div>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Swift Africa
          </span>
        </div>

        {/* Onglets desktop */}
        <nav className="glass ml-1 hidden rounded-2xl p-1 md:flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Actions droite */}
        <div className="ml-auto flex items-center gap-2">
          {waking && !offline && (
            <span className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground sm:flex">
              <Loader2 className="size-3.5 animate-spin" /> Réveil du serveur…
            </span>
          )}
          {offline && (
            <span className="hidden items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1.5 text-xs font-medium text-destructive sm:flex">
              <WifiOff className="size-3.5" /> Hors ligne
            </span>
          )}

          {/* Switch de rôle si multi-rôle */}
          {availableRoles.length > 1 && (
            <select
              value={activeRole}
              onChange={(e) => setMode(e.target.value as typeof activeRole)}
              className="glass hidden rounded-xl border-0 bg-transparent px-3 py-1.5 text-xs font-semibold capitalize text-foreground outline-none sm:block"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          )}

          {/* 🔔 Bouton Notifications messages non lus */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="glass relative flex size-10 items-center justify-center rounded-xl text-foreground transition hover:bg-secondary"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {nonLus > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                  {nonLus > 9 ? '9+' : nonLus}
                </span>
              )}
            </button>

            {/* Panel déroulant */}
            {notifOpen && (
              <div className="glass-strong absolute right-0 top-12 z-50 w-80 rounded-3xl p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold">Messages non lus</p>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {nonLus === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                    <Bell className="size-8 opacity-30" />
                    <p className="text-sm">Aucun message non lu</p>
                  </div>
                ) : convs.length > 0 ? (
                  <ul className="grid gap-2">
                    {convs.map((c) => (
                      <li key={c.commande_id}>
                        <button
                          onClick={() => {
                            setNotifOpen(false)
                            onTab('commandes')
                          }}
                          className="glass w-full rounded-2xl p-3 text-left transition hover:bg-secondary"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="size-4 shrink-0 text-primary" />
                            <p className="text-xs font-semibold">
                              Commande #{String(c.commande_id).slice(-6)}
                            </p>
                            {c.non_lus > 0 && (
                              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                {c.non_lus}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            <span className="font-medium">{c.dernier_auteur} :</span> {c.dernier_message}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                    <MessageCircle className="size-8 opacity-30" />
                    <p className="text-sm">{nonLus} message(s) non lu(s)</p>
                    <button
                      onClick={() => { setNotifOpen(false); onTab('commandes') }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Voir mes commandes →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panier — visible seulement pour acheteur */}
          {activeRole === 'acheteur' && (
            <button
              onClick={onOpenCart}
              className="glass relative flex size-10 items-center justify-center rounded-xl text-foreground transition hover:bg-secondary"
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Avatar */}
          <div className="glass hidden items-center gap-2 rounded-xl px-3 py-1.5 sm:flex">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {user.prenom?.[0] ?? '?'}{user.nom?.[0] ?? ''}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold">{user.prenom}</p>
              <p className="text-[10px] capitalize text-muted-foreground">
                {activeRole}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="size-10 rounded-xl text-muted-foreground hover:text-destructive"
            aria-label="Se déconnecter"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </div>

      {/* Onglets mobile */}
      <nav className="glass mx-auto mt-2 flex max-w-7xl rounded-2xl p-1 md:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={`flex-1 rounded-xl px-2 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
