'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Send, X, MessageCircle, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { apiFetch, ApiError } from '@/lib/api'
import { useApp } from '@/lib/store'

interface Participant {
  id: string
  nom: string
  role: 'acheteur' | 'vendeur' | 'livreur'
}

interface Message {
  id: number
  auteur_id: string
  auteur_nom: string
  role_auteur: 'acheteur' | 'vendeur' | 'livreur'
  contenu: string
  envoye_le: string
  est_moi: boolean
}

interface Conversation {
  id: number
  commande: number
  participants_info: Participant[]
  messages: Message[]
  non_lus: number
}

const ROLE_COLORS: Record<string, string> = {
  acheteur: 'bg-blue-500/15 text-blue-600',
  vendeur: 'bg-orange-500/15 text-orange-600',
  livreur: 'bg-green-500/15 text-green-600',
}

const ROLE_LABELS: Record<string, string> = {
  acheteur: 'Acheteur',
  vendeur: 'Vendeur',
  livreur: 'Livreur',
}

interface ChatProps {
  commandeId: number
  onClose: () => void
}

export function ChatCommande({ commandeId, onClose }: ChatProps) {
  const { user } = useApp()
  const [conv, setConv] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const loadConv = useCallback(async () => {
    try {
      const data = await apiFetch<Conversation>(`chat/commande/${commandeId}/`)
      setConv(data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger le chat.')
    } finally {
      setLoading(false)
    }
  }, [commandeId])

  useEffect(() => {
    loadConv()
    // Polling toutes les 5s pour les nouveaux messages
    pollRef.current = setInterval(loadConv, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [loadConv])

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages.length])

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [loading])

  async function handleSend() {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setMessage('')
    try {
      await apiFetch(`chat/commande/${commandeId}/`, {
        method: 'POST',
        body: { contenu: text },
      })
      await loadConv()
    } catch (err) {
      setMessage(text) // remettre le message si erreur
      setError('Envoi échoué, réessayez.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Chat window */}
      <GlassCard
        strong
        className="relative z-10 flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl sm:h-[600px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            <div>
              <p className="text-sm font-bold">Chat — Commande #{commandeId}</p>
              {conv && (
                <p className="text-xs text-muted-foreground">
                  {conv.participants_info.map((p) => p.nom.split(' ')[0]).join(', ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Participants badges */}
        {conv && (
          <div className="flex gap-2 overflow-x-auto border-b border-border/40 px-4 py-2">
            {conv.participants_info.map((p) => (
              <span
                key={p.id}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[p.role]}`}
              >
                <span className="opacity-70">{ROLE_LABELS[p.role]}</span>
                <span className="font-semibold">{p.nom.split(' ')[0]}</span>
              </span>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl bg-destructive/10 p-4 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {conv && conv.messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <MessageCircle className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Aucun message pour le moment.<br />Commencez la conversation !
              </p>
            </div>
          )}

          {conv && (() => {
            let lastDate = ''
            return conv.messages.map((msg) => {
              const dateLabel = formatDate(msg.envoye_le)
              const showDate = dateLabel !== lastDate
              lastDate = dateLabel
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="my-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-border/50" />
                      <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                  )}
                  <div className={`mb-2 flex ${msg.est_moi ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.est_moi ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!msg.est_moi && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[msg.role_auteur]}`}>
                          {msg.auteur_nom.split(' ')[0]} · {ROLE_LABELS[msg.role_auteur]}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.est_moi
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm bg-secondary text-foreground'
                        }`}
                      >
                        {msg.contenu}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(msg.envoye_le)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          })()}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Écrire un message…"
              disabled={sending}
              className="flex-1 rounded-2xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Entrée pour envoyer · Visible par tous les participants
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
