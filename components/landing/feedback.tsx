'use client'

import { useEffect, useRef, useState } from 'react'
import { Bug, Lightbulb, Send, CheckCircle2, ChevronDown } from 'lucide-react'

const EMAIL = 'swiftafrica@gmail.com'

export function Feedback() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [showBug, setShowBug] = useState(false)
  const [showSug, setShowSug] = useState(false)
  const [bugForm, setBugForm] = useState({ nom: '', email: '', message: '' })
  const [sugForm, setSugForm] = useState({ nom: '', email: '', message: '' })
  const [bugSent, setBugSent] = useState(false)
  const [sugSent, setSugSent] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  function handleBug() {
    const subject = encodeURIComponent(`[Swift Africa] 🐛 Bug — ${bugForm.nom || 'Anonyme'}`)
    const body = encodeURIComponent(`Nom : ${bugForm.nom || 'Anonyme'}\nEmail : ${bugForm.email || 'Non renseigné'}\n\nDescription :\n${bugForm.message}`)
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`)
    setBugSent(true)
  }

  function handleSug() {
    const subject = encodeURIComponent(`[Swift Africa] 💡 Suggestion — ${sugForm.nom || 'Anonyme'}`)
    const body = encodeURIComponent(`Nom : ${sugForm.nom || 'Anonyme'}\nEmail : ${sugForm.email || 'Non renseigné'}\n\nSuggestion :\n${sugForm.message}`)
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`)
    setSugSent(true)
  }

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div
          className="mb-10 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            Votre avis compte
          </span>
          <h2 className="mb-3 text-4xl font-black tracking-tight md:text-5xl">
            Aidez-nous à améliorer<br />Swift Africa
          </h2>
          <p className="text-gray-600">
            Chaque retour nous aide à construire une meilleure plateforme pour toute l'Afrique de l'Ouest.
          </p>
        </div>

        <div
          className="space-y-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          }}
        >
          {/* ── BLOC BUG ── */}
          <div className="overflow-hidden rounded-3xl border-2 border-red-100 bg-white shadow-sm">
            {/* Bouton */}
            <button
              onClick={() => setShowBug((v) => !v)}
              className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-red-50"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                <Bug className="size-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Signaler un bug</p>
                <p className="text-sm text-gray-500">Quelque chose ne fonctionne pas ? Dites-le nous.</p>
              </div>
              <ChevronDown
                className="size-5 shrink-0 text-gray-400 transition-transform duration-300"
                style={{ transform: showBug ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>

            {/* Formulaire dépliable */}
            <div style={{ maxHeight: showBug ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
              <div className="border-t border-red-100 px-6 py-5">
                {bugSent ? (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <CheckCircle2 className="size-12 text-green-500" />
                    <p className="font-bold">Bug signalé — merci !</p>
                    <button onClick={() => { setBugSent(false); setBugForm({ nom: '', email: '', message: '' }) }} className="text-sm text-red-500 hover:underline">
                      Signaler un autre bug
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={bugForm.nom} onChange={(e) => setBugForm({ ...bugForm, nom: e.target.value })} placeholder="Nom (optionnel)" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                      <input type="email" value={bugForm.email} onChange={(e) => setBugForm({ ...bugForm, email: e.target.value })} placeholder="Email (optionnel)" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
                    </div>
                    <textarea
                      value={bugForm.message}
                      onChange={(e) => setBugForm({ ...bugForm, message: e.target.value })}
                      placeholder="Que s'est-il passé ? Sur quelle page ? Quel appareil ?"
                      rows={4}
                      className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                    <button
                      onClick={handleBug}
                      disabled={bugForm.message.length < 10}
                      className="wave-btn flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-40 overflow-hidden relative"
                    >
                      <Send className="size-4" /> Signaler ce bug
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BLOC SUGGESTION ── */}
          <div className="overflow-hidden rounded-3xl border-2 border-orange-100 bg-white shadow-sm">
            {/* Bouton */}
            <button
              onClick={() => setShowSug((v) => !v)}
              className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-orange-50"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
                <Lightbulb className="size-6 text-[#ff6b00]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Une suggestion</p>
                <p className="text-sm text-gray-500">Une idée pour améliorer Swift Africa ? Partagez-la.</p>
              </div>
              <ChevronDown
                className="size-5 shrink-0 text-gray-400 transition-transform duration-300"
                style={{ transform: showSug ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>

            {/* Formulaire dépliable */}
            <div style={{ maxHeight: showSug ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
              <div className="border-t border-orange-100 px-6 py-5">
                {sugSent ? (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <CheckCircle2 className="size-12 text-green-500" />
                    <p className="font-bold">Suggestion reçue — merci !</p>
                    <button onClick={() => { setSugSent(false); setSugForm({ nom: '', email: '', message: '' }) }} className="text-sm text-[#ff6b00] hover:underline">
                      Envoyer une autre suggestion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={sugForm.nom} onChange={(e) => setSugForm({ ...sugForm, nom: e.target.value })} placeholder="Nom (optionnel)" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20" />
                      <input type="email" value={sugForm.email} onChange={(e) => setSugForm({ ...sugForm, email: e.target.value })} placeholder="Email (optionnel)" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20" />
                    </div>
                    <textarea
                      value={sugForm.message}
                      onChange={(e) => setSugForm({ ...sugForm, message: e.target.value })}
                      placeholder="Quelle fonctionnalité aimeriez-vous voir ? Comment améliorerait-elle votre expérience ?"
                      rows={4}
                      className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                    />
                    <button
                      onClick={handleSug}
                      disabled={sugForm.message.length < 10}
                      className="wave-btn flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] py-3 text-sm font-bold text-white transition hover:bg-[#e55f00] disabled:opacity-40 overflow-hidden relative"
                    >
                      <Send className="size-4" /> Envoyer ma suggestion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
