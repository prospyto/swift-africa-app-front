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

export function AppShell() {
  const { user, ready } = useApp()
  const [tab, setTab] = useState('catalogue')
  const [cartOpen, setCartOpen] = useState(false)

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
      <Navbar tab={tab} onTab={setTab} onOpenCart={() => setCartOpen(true)} />
      {tab === 'catalogue' && <Catalog />}
      {tab === 'commandes' && <Orders />}
      {tab === 'espace' && <Espace />}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrdered={() => setTab('commandes')}
      />
    </div>
  )
}
