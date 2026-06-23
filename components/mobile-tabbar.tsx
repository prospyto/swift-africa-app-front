'use client'

import { LayoutGrid, ClipboardList, UserCircle2 } from 'lucide-react'

interface Tab {
  id: string
  label: string
}

const TAB_ICONS: Record<string, typeof LayoutGrid> = {
  catalogue: LayoutGrid,
  commandes: ClipboardList,
  espace: UserCircle2,
}

export function MobileTabBar({
  tab,
  onTab,
  tabs,
}: {
  tab: string
  onTab: (t: string) => void
  tabs: Tab[]
}) {
  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex rounded-2xl p-1 md:hidden">
      {tabs.map((t) => {
        const Icon = TAB_ICONS[t.id] ?? LayoutGrid
        const active = tab === t.id
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            <Icon className="size-5" />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
