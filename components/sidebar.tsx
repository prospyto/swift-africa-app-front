'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Truck,
  ShoppingCart,
  LogOut,
  WifiOff,
  Loader2,
  Bell,
  MessageCircle,
  X,
  LayoutGrid,
  ClipboardList,
  UserCircle2,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { apiFetch } from '@/lib/api'

interface Tab {
  id: string
  label: string
}

interface SidebarProps {
  tab: string
  onTab: (t: string) => void
  onOpenCart: () => void
  onOpenConversation: (commandeId: number) => void
  tabs: Tab[]
}

interface ConvResume {
  commande_id: number
  non_lus: number
  dernier_message: string
  dernier_auteur: string
}

// Chaque onglet logique (catalogue / commandes / espace) garde la même
// icône peu importe le rôle — seul le label change selon le rôle.
const TAB_ICONS: Record<string, typeof LayoutGrid> = {
  catalogue: LayoutGrid,
  commandes: ClipboardList,
  espace: UserCircle2,
}

export function Sidebar({ tab, onTab, onOpenCart, onOpenConversation, tabs }: SidebarProps) {
  const { user, logout, cartCount, offline, waking, mode, availableRoles, setMode } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const [nonLus, setNonLus] = useState(0)
  const [convs, setConvs] = useState<ConvResume[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

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
    <aside className="glass-strong sticky top-3 ml-3 hidden h-[calc(100vh-1.5rem)] w-64 flex-col rounded-3xl p-4 md:flex">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="glass-cta flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Truck className="size-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">Swift Africa</span>
      </div>

      {/* Switch de rôle si multi-rôle */}
      {availableRoles.length > 1 && (
        <select
          value={activeRole}
          onChange={(e) => setMode(e.target.value as typeof activeRole)}
          className="glass mb-4 rounded-xl border-0 bg-transparent px-3 py-2 text-xs font-semibold capitalize text-foreground outline-none"
        >
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      )}

      {/* Navigation principale */}
      <nav className="flex flex-col gap-1">
        {tabs.map((t) => {
          const Icon = TAB_ICONS[t.id] ?? LayoutGrid
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {t.label}
            </button>
          )
        })}

        {/* Panier — visible seulement pour acheteur */}
        {activeRole === 'acheteur' && (
          <button
            onClick={onOpenCart}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <ShoppingCart className="size-5 shrink-0" />
            Panier
            {cartCount > 0 && (
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <Bell className="size-5 shrink-0" />
            Notifications
            {nonLus > 0 && (
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                {nonLus > 9 ? '9+' : nonLus}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="glass-strong fixed inset-x-3 top-20 z-50 max-h-[70vh] overflow-y-auto rounded-3xl p-4 shadow-xl md:absolute md:inset-x-auto md:left-full md:top-0 md:ml-3 md:w-80">
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
                          onOpenConversation(c.commande_id)
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
      </nav>

      {/* Statuts réseau */}
      <div className="mt-4 flex flex-col gap-2">
        {waking && !offline && (
          <span className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Réveil du serveur…
          </span>
        )}
        {offline && (
          <span className="flex items-center gap-1.5 rounded-xl bg-destructive/15 px-3 py-2 text-xs font-medium text-destructive">
            <WifiOff className="size-3.5" /> Hors ligne
          </span>
        )}
      </div>

      {/* Avatar + logout, en bas */}
      <div className="mt-auto flex items-center gap-2 rounded-2xl px-1 pt-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {user.prenom?.[0] ?? '?'}{user.nom?.[0] ?? ''}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">{user.prenom}</p>
          <p className="text-[11px] capitalize text-muted-foreground">{activeRole}</p>
        </div>
        <button
          onClick={logout}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          aria-label="Se déconnecter"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </aside>
  )
}
