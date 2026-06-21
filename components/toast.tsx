'use client'

import { useState, useCallback, createContext, useContext, useRef } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---- Types ----
type ToastType = 'success' | 'error'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void
}

// ---- Context ----
const ToastContext = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toaster — coin bas gauche, au-dessus de tout */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex min-w-[260px] max-w-[90vw] items-center gap-3 rounded-2xl px-4 py-3 shadow-xl',
              'animate-in slide-in-from-bottom-4 fade-in duration-300',
              t.type === 'success'
                ? 'bg-success text-success-foreground'
                : 'bg-destructive text-destructive-foreground',
            )}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="size-5 shrink-0" />
            ) : (
              <XCircle className="size-5 shrink-0" />
            )}
            <p className="flex-1 text-sm font-semibold">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-70 hover:opacity-100"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
