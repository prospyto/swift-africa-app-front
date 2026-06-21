'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface RatingStarsProps {
  commandeId: number
  typeNote: 'acheteur_vendeur' | 'vendeur_livreur'
  label: string        // ex: "le vendeur" / "le livreur"
  onDone?: () => void
}

export function RatingStars({ commandeId, typeNote, label, onDone }: RatingStarsProps) {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selected || sending) return
    setSending(true)
    setError(null)
    try {
      await apiFetch(`commandes/${commandeId}/noter/`, {
        method: 'POST',
        body: { type_note: typeNote, note: selected, commentaire },
      })
      setDone(true)
      onDone?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la notation.')
    } finally {
      setSending(false)
    }
  }

  if (done) return (
    <div className="flex items-center gap-2 rounded-2xl bg-success/10 p-3 text-sm font-semibold text-success">
      <CheckCircle2 className="size-4 shrink-0" />
      Merci pour votre évaluation !
    </div>
  )

  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Évaluer {label}
      </p>

      {/* Étoiles */}
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <Star
              className="size-7"
              fill={(hover || selected) >= n ? '#f59e0b' : 'none'}
              stroke={(hover || selected) >= n ? '#f59e0b' : 'currentColor'}
              strokeWidth={1.5}
            />
          </button>
        ))}
        {selected > 0 && (
          <span className="ml-2 self-center text-sm font-semibold text-amber-500">
            {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'][selected]}
          </span>
        )}
      </div>

      {/* Commentaire */}
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Laisser un commentaire (optionnel)…"
        rows={2}
        className="mb-3 w-full resize-none rounded-xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!selected || sending}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Envoyer l'évaluation
      </button>
    </div>
  )
}
