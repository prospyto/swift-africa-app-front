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
  const [isAnimating, setIsAnimating] = useState(false)

  const handleTabChange = (newTab: string) => {
    if (newTab !== tab) {
      setIsAnimating(true)
      setTab(newTab)
      // Reset animation after transition
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

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
      <Navbar tab={tab} onTab={handleTabChange} onOpenCart={() => setCartOpen(true)} />
      
      {/* Tab content with fade transition */}
      <div className={`transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}>
        {tab === 'catalogue' && <Catalog />}
        {tab === 'commandes' && <Orders />}
        {tab === 'espace' && <Espace />}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrdered={() => handleTabChange('commandes')}
      />
    </div>
  )
}
