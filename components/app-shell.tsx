'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { AuthScreen } from '@/components/auth-screen'
import { Sidebar } from '@/components/sidebar'
import { MobileTabBar } from '@/components/mobile-tabbar'
import { Catalog } from '@/components/catalog'
import { Orders } from '@/components/orders'
import { Espace } from '@/components/espace'
import { CartDrawer } from '@/components/cart-drawer'
import { Spinner } from '@/components/glass'
import { ToastProvider } from '@/components/toast'
import { Truck, ShoppingCart, Bell, LogOut } from 'lucide-react'

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
  const { user, ready, mode, logout } = useApp()
  const [cartOpen, setCartOpen] = useState(false)
  const [openConversationFor, setOpenConversationFor] = useState<number | null>(null)

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
    <div className="flex min-h-screen">
      <Sidebar
        tab={currentTab}
        onTab={setTab}
        onOpenCart={() => setCartOpen(true)}
        onOpenConversation={(commandeId) => {
          setOpenConversationFor(commandeId)
          setTab('commandes')
        }}
        tabs={tabs}
      />

      {/* Barre mobile minimaliste — la navigation principale est en bas (MobileTabBar) */}
      <header className="glass-strong sticky top-3 z-30 mx-3 flex items-center gap-2 rounded-2xl px-4 py-2.5 md:hidden">
        <div className="glass-cta flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Truck className="size-4" />
        </div>
        <span className="text-base font-bold tracking-tight">Swift Africa</span>
        <div className="ml-auto flex items-center gap-1">
          {activeRole === 'acheteur' && (
            <button
              onClick={() => setCartOpen(true)}
              className="flex size-9 items-center justify-center rounded-xl text-foreground transition hover:bg-secondary"
              aria-label="Panier"
            >
              <ShoppingCart className="size-5" />
            </button>
          )}
          <button
            onClick={() => setTab('commandes')}
            className="flex size-9 items-center justify-center rounded-xl text-foreground transition hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>
          <button
            onClick={logout}
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Se déconnecter"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-3 pb-24 pt-3 md:px-6 md:pb-12 md:pt-6">
        {currentTab === 'catalogue' && <Catalog />}
        {currentTab === 'commandes' && (
          <Orders
            openConversationFor={openConversationFor}
            onConversationOpened={() => setOpenConversationFor(null)}
          />
        )}
        {currentTab === 'espace' && <Espace />}
      </main>

      <MobileTabBar tab={currentTab} onTab={setTab} tabs={tabs} />

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
