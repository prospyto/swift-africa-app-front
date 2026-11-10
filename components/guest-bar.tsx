'use client'

import { ShoppingCart, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'

/** Barre du haut pour un visiteur non connecté : panier + connexion. */
export function GuestBar({
  onOpenCart,
  onLogin,
}: {
  onOpenCart: () => void
  onLogin: () => void
}) {
  const { cartCount } = useApp()
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="glass-strong mx-auto flex max-w-7xl items-center gap-3 rounded-3xl px-4 py-3 md:px-5">
        <div className="flex items-center gap-2.5">
          <div className="glass-cta flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Swift Africa</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
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
          <Button onClick={onLogin} className="h-10 rounded-xl px-4 text-sm font-semibold">
            Se connecter
          </Button>
        </div>
      </div>
    </header>
  )
}
