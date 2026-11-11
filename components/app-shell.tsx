'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/store'
import { AuthScreen } from '@/components/auth-screen'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { GuestBar } from '@/components/guest-bar'
import { Catalog } from '@/components/catalog'
import { BoutiquesList } from '@/components/boutiques-list'
import { VendeurAccueil } from '@/components/vendeur-accueil'
import { BoutiquePage } from '@/components/boutique-page'
import { Orders } from '@/components/orders'
import { Espace } from '@/components/espace'
import { CartDrawer } from '@/components/cart-drawer'
import { Spinner } from '@/components/glass'
import { ToastProvider } from '@/components/toast'

// Onglets selon le rôle actif
const TABS_BY_ROLE = {
  acheteur: [
    { id: 'boutiques', label: 'Boutiques' },
    { id: 'catalogue', label: 'Produits' },
    { id: 'commandes', label: 'Mes commandes' },
    { id: 'espace', label: 'Mon espace' },
  ],
  vendeur: [
    { id: 'accueil', label: 'Accueil' },
    { id: 'commandes', label: 'Commandes reçues' },
    { id: 'espace', label: 'Mes produits' },
  ],
  livreur: [
    { id: 'espace', label: 'Mes missions' },
    { id: 'commandes', label: 'Historique' },
  ],
}

function AppShellInner() {
  const { user, ready, mode } = useApp()
  const [cartOpen, setCartOpen] = useState(false)
  // Visiteur : l'écran de connexion s'ouvre sur demande. `fromCart` sert à
  // rouvrir le panier juste après la connexion.
  const [authOpen, setAuthOpen] = useState(false)
  const [fromCart, setFromCart] = useState(false)
  // Boutique ouverte (page publique), au-dessus du catalogue
  const [boutiqueId, setBoutiqueId] = useState<number | null>(null)
  const [openConversationFor, setOpenConversationFor] = useState<{ commandeId: number; avecRole: string } | null>(null)

  const activeRole = mode || user?.role || 'acheteur'
  const tabs = TABS_BY_ROLE[activeRole] ?? TABS_BY_ROLE.acheteur

  // Onglet par défaut selon le rôle
  const defaultTab = tabs[0].id
  const [tab, setTab] = useState(defaultTab)

  // Quand le rôle change, revenir au premier onglet
  const currentTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id

  // Après connexion depuis le panier : on rouvre le panier (acheteur seulement,
  // le panier n'existe pas pour les autres rôles).
  useEffect(() => {
    if (user && fromCart) {
      if (user.role === 'acheteur') setCartOpen(true)
      setFromCart(false)
      setAuthOpen(false)
    }
  }, [user, fromCart])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!user) {
    if (authOpen) return <AuthScreen onClose={() => setAuthOpen(false)} />
    return (
      <div className="min-h-screen pb-12">
        <GuestBar onOpenCart={() => setCartOpen(true)} onLogin={() => setAuthOpen(true)} />
        {boutiqueId != null ? (
          <BoutiquePage id={boutiqueId} onBack={() => setBoutiqueId(null)} />
        ) : (
          <BoutiquesList onOpenBoutique={setBoutiqueId} />
        )}
        <CartDrawer
          guest
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onOrdered={() => {}}
          onLoginRequired={() => { setFromCart(true); setAuthOpen(true) }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      <Navbar
        onTab={setTab}
        onOpenCart={() => setCartOpen(true)}
        onOpenConversation={(commandeId, avecRole) => {
          setOpenConversationFor({ commandeId, avecRole })
          setTab('commandes')
        }}
      />
      {currentTab === 'accueil' && <VendeurAccueil onTab={setTab} />}
      {currentTab === 'boutiques' &&
        (boutiqueId != null ? (
          <BoutiquePage id={boutiqueId} onBack={() => setBoutiqueId(null)} />
        ) : (
          <BoutiquesList onOpenBoutique={setBoutiqueId} />
        ))}
      {currentTab === 'catalogue' &&
        (boutiqueId != null ? (
          <BoutiquePage id={boutiqueId} onBack={() => setBoutiqueId(null)} />
        ) : (
          <Catalog onOpenBoutique={setBoutiqueId} />
        ))}
      {currentTab === 'commandes' && (
        <Orders
          openConversationFor={openConversationFor}
          onConversationOpened={() => setOpenConversationFor(null)}
        />
      )}
      {currentTab === 'espace' && <Espace />}
      <BottomNav tabs={tabs} tab={currentTab} onTab={(t) => { setBoutiqueId(null); setTab(t) }} role={activeRole} />
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
