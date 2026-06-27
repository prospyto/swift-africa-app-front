'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { AuthScreen } from '@/components/auth-screen'
import { Navbar } from '@/components/navbar'
import { Catalog } from '@/components/catalog'
import { Orders } from '@/components/orders'
import { Espace } from '@/components/espace'
import { CartDrawer } from '@/components/cart-drawer'
import { Spinner } from '@/components/glass'
import { ToastProvider } from '@/components/toast'

// Onglets selon le rôle actif
const TABS_BY_ROLE = {
  acheteur: [
    { id: 'catalogue', label: 'Catalogue' },
    { id: 'commandes', label: 'Mes commandes' },
    { id: 'espace', label: 'Mon espace' },
  ],
  vendeur: [
    { id: 'espace', label: 'Mes produits' },
    { id: 'catalogue', label: 'Catalogue' },
    { id: 'commandes', label: 'Commandes reçues' },
  ],
  livreur: [
    { id: 'espace', label: 'Mes missions' },
    { id: 'catalogue', label: 'Catalogue' },
    { id: 'commandes', label: 'Historique' },
  ],
}

function AppShellInner() {
  const { user, ready, mode } = useApp()
  const [cartOpen, setCartOpen] = useState(false)
  const [openConversationFor, setOpenConversationFor] = useState<{ commandeId: number; avecRole: string } | null>(null)

  const activeRole = mode || user?.role || 'acheteur'
  const tabs = TABS_BY_ROLE[activeRole] ?? TABS_BY_ROLE.acheteur

  // Onglet par défaut selon le rôle
  const defaultTab = tabs[0].id
  const [tab, setTab] = useState(defaultTab)

  // Quand le rôle change, revenir au premier onglet
  const currentTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!user) return <AuthScreen />

  return (
    <div className="min-h-screen pb-12">
      <Navbar
        tab={currentTab}
        onTab={setTab}
        onOpenCart={() => setCartOpen(true)}
        onOpenConversation={(commandeId, avecRole) => {
          setOpenConversationFor({ commandeId, avecRole })
          setTab('commandes')
        }}
        tabs={tabs}
      />
      {currentTab === 'catalogue' && <Catalog />}
      {currentTab === 'commandes' && (
        <Orders
          openConversationFor={openConversationFor}
          onConversationOpened={() => setOpenConversationFor(null)}
        />
      )}
      {currentTab === 'espace' && <Espace />}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrdered={() => setTab('commandes')}
      />
    </div>
  )
}

export function AppShell() {
  return (
    <ToastProvider>
      <AppShellInner />
    </ToastProvider>
  )
}
