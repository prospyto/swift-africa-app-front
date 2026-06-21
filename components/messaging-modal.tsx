'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, MessageCircle, Loader2 } from 'lucide-react'
import { GlassCard, Spinner } from '@/components/glass'
import { useApp } from '@/lib/store'
import { apiFetch, ApiError } from '@/lib/api'
import { maskPhoneNumbers, formatMessageTime, getChatTypeLabel } from '@/lib/messaging'

// Les 3 canaux de communication selon le rôle de l'utilisateur
type ChatType = 'buyer_seller' | 'seller_delivery' | 'buyer_delivery'

const CHAT_TABS: { type: ChatType; roles: string[] }[] = [
  { type: 'buyer_seller',    roles: ['acheteur', 'vendeur'] },
  { type: 'seller_delivery', roles: ['vendeur', 'livreur'] },
  { type: 'buyer_delivery',  roles: ['acheteur', 'livreur'] },
]

interface BackendMessage {
  id: number
  auteur_id: string
  auteur_nom: string
  role_auteur: 'acheteur' | 'vendeur' | 'livreur'
  contenu: string
  envoye_le: string
  est_moi: boolean
}

interface BackendConv {
  id: number
  commande: number
  participants_info: { id: string; nom: string; role: string }[]
  messages: BackendMessage[]
  non_lus: number
}

interface MessagingModalProps {
  orderId: number
  open: boolean
  onClose: () => void
}

// Couleurs par rôle — cohérent avec ChatCommande
const ROLE_COLORS: Record<string, string> = {
  acheteur: 'bg-blue-500/15 text-blue-600',
  vendeur:  'bg-orange-500/15 text-orange-600',
  livreur:  'bg-green-500/15 text-green-600',
}
const ROLE_LABELS: Record<string, string> = {
  acheteur: 'Acheteur',
  vendeur:  'Vendeur',
  livreur:  'Livreur',
}

export function MessagingModal({ orderId, open, onClose }: MessagingModalProps) {
  const { user, mode } = useApp()
  const activeRole = mode || user?.role || 'acheteur'

  // Onglet par défaut : le canal qui implique le rôle actif en premier
  const defaultTab = CHAT_TABS.find((t) => t.roles[0] === activeRole)?.type ?? 'buyer_seller'
  const [currentTab, setCurrentTab] = useState<ChatType>(defaultTab)
  const [conv, setConv] = useState<BackendConv | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const loadConv = useCallback(async () => {
    try {
      const data = await apiFetch<BackendConv>(`chat/commande/${orderId}/`)
      setConv(data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger le chat.')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    loadConv()
    pollRef.current = setInterval(loadConv, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [open, loadConv])

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages.length])

  // Focus input à l'ouverture
  useEffect(() => {
    if (!loading && open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [loading, open])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      await apiFetch(`chat/commande/${orderId}/`, {
        method: 'POST',
        body: { contenu: text },
      })
      await loadConv()
    } catch {
      setInput(text)
      setError('Envoi échoué, réessayez.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Filtre les messages selon le canal sélectionné
  // Les participants du canal déterminent quels messages sont "visibles"
  // Comme le backend a une seule conversation, on filtre côté frontend par rôle
  const tabParticipants = CHAT_TABS.find((t) => t.type === currentTab)?.roles ?? []
  const filteredMessages = conv?.messages.filter(
    (m) => tabParticipants.includes(m.role_auteur)
  ) ?? []

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-3xl glass-strong shadow-2xl md:bottom-8 md:left-auto md:right-8 md:top-8 md:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            <div>
              <p className="text-sm font-bold">Messages — Commande #{String(orderId).slice(-6)}</p>
              {conv && (
                <p className="text-xs text-muted-foreground">
                  {conv.participants_info.map((p) => p.nom.split(' ')[0]).join(', ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 3 onglets de canal */}
        <div className="flex gap-1 border-b border-border/60 px-3 pt-2 pb-0">
          {CHAT_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setCurrentTab(tab.type)}
              className={`flex-1 rounded-t-xl px-2 py-2 text-[11px] font-semibold transition ${
                currentTab === tab.type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {getChatTypeLabel(tab.type).split(' · ').map((r, i) => (
                <span key={i}>{i > 0 ? ' · ' : ''}{r}</span>
              ))}
            </button>
          ))}
        </div>

        {/* Corps des messages */}
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
          {!loading && filteredMessages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <MessageCircle className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {getChatTypeLabel(currentTab)}<br />
                <span className="text-xs">Aucun message pour ce canal.</span>
              </p>
            </div>
          )}
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`mb-2 flex ${msg.est_moi ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex flex-col gap-0.5 ${msg.est_moi ? 'items-end' : 'items-start'}`}>
                {!msg.est_moi && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[msg.role_auteur]}`}>
                    {msg.auteur_nom.split(' ')[0]} · {ROLE_LABELS[msg.role_auteur]}
                  </span>
                )}
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.est_moi
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm bg-secondary text-foreground'
                }`}>
                  {maskPhoneNumbers(msg.contenu)}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatMessageTime(msg.envoye_le)}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Écrire un message…"
              disabled={sending}
              className="flex-1 rounded-2xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Les numéros de téléphone sont masqués automatiquement
          </p>
        </div>
      </div>
    </>
  )
}
