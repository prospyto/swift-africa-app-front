'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { GlassCard, Spinner } from '@/components/glass'
import { useApp } from '@/lib/store'
import type { Message, MessageChatType } from '@/lib/types'
import { maskPhoneNumbers, formatMessageTime, getChatTypeLabel } from '@/lib/messaging'

interface MessagingModalProps {
  orderId: number
  open: boolean
  onClose: () => void
}

const CHAT_TYPES: MessageChatType[] = ['buyer_seller', 'seller_delivery', 'buyer_delivery']

export function MessagingModal({ orderId, open, onClose }: MessagingModalProps) {
  const { user } = useApp()
  const [currentTab, setCurrentTab] = useState<MessageChatType>('buyer_seller')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // In production, this would fetch from the backend
  const handleSendMessage = async () => {
    if (!input.trim() || !user) return
    
    setLoading(true)
    const newMessage: Message = {
      id: Date.now(),
      orderId,
      sender: user.prenom,
      senderRole: user.role,
      content: input,
      chatType: currentTab,
      timestamp: new Date().toISOString(),
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setLoading(false)
  }

  const chatMessages = messages.filter((m) => m.chatType === currentTab)

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-4 z-50 flex flex-col rounded-3xl glass-strong md:bottom-8 md:right-8 md:top-8 md:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <h3 className="font-semibold">Messages - Commande #{String(orderId).slice(-6)}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Chat type tabs */}
        <div className="flex gap-1 border-b border-border/60 px-3 pt-3">
          {CHAT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setCurrentTab(type)}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition ${
                currentTab === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {getChatTypeLabel(type).split('-')[0].trim()}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageCircle className="size-8 mb-2 opacity-40" />
              <p className="text-sm">Aucun message pour l&apos;instant</p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === user?.role ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.senderRole === user?.role
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <p className="text-xs font-medium opacity-70 mb-1">
                      {msg.sender}
                    </p>
                    <p className="text-sm break-words">
                      {maskPhoneNumbers(msg.content)}
                    </p>
                    <p className={`text-xs mt-1 ${
                      msg.senderRole === user?.role
                        ? 'opacity-70'
                        : 'opacity-50'
                    }`}>
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/60 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Écrivez un message…"
              className="flex-1 rounded-2xl border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
