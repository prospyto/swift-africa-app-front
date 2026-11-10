'use client'

import { ClipboardList, LayoutGrid, Store, Truck, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/lib/types'

interface Tab {
  id: string
  label: string
}

// L'onglet "espace" change de nature selon le rôle : on adapte l'icône.
const ESPACE_ICON: Record<Role, LucideIcon> = {
  acheteur: User,
  vendeur: Store,
  livreur: Truck,
}

function iconFor(tabId: string, role: Role): LucideIcon {
  if (tabId === 'catalogue') return LayoutGrid
  if (tabId === 'commandes') return ClipboardList
  return ESPACE_ICON[role]
}

/** Barre d'onglets fixée en bas de l'écran, pour tous les rôles. */
export function BottomNav({
  tabs,
  tab,
  onTab,
  role,
}: {
  tabs: Tab[]
  tab: string
  onTab: (id: string) => void
  role: Role
}) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 px-3 md:px-6"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="glass-strong mx-auto flex max-w-xl gap-1 rounded-3xl p-1.5 shadow-lg">
        {tabs.map((t) => {
          const active = tab === t.id
          const Icon = iconFor(t.id, role)
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition sm:text-xs ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span className="w-full truncate text-center">{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
