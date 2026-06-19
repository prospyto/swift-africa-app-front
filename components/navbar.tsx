'use client'

import { Truck, ShoppingCart, LogOut, WifiOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'

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

export function Navbar({ tab, onTab, onOpenCart, tabs }: NavbarProps) {
  const { user, logout, cartCount, offline, waking, mode, availableRoles, setMode } = useApp()
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
