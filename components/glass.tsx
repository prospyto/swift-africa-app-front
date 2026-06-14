import type * as React from 'react'
import { cn } from '@/lib/utils'

export function GlassCard({
  className,
  strong,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-3xl',
        className,
      )}
      {...props}
    />
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-foreground/10',
        className,
      )}
    />
  )
}
