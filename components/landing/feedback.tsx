'use client'

import { useEffect, useRef, useState } from 'react'
import { Bug, Lightbulb, Send, CheckCircle2 } from 'lucide-react'

const EMAIL = 'swiftafrica@gmail.com'

export function Feedback() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [tab, setTab] = useState<'bug' | 'suggestion'>('bug')
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
    const body = encodeURIComponent(`Nom : ${bugForm.nom || 'Anonyme'}\nEmail : ${bugForm.email || 'Non renseigné'}\n\nDescription du bug :\n${bugForm.message}`)
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
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          }}
        >
          {/* Tabs */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setTab('bug')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-4 text-sm font-bold transition-all ${
                tab === 'bug'
                  ? 'border-red-500 bg-red-500 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
              }`}
            >
              <Bug className="size-5" />
              Signaler un bug
            </button>
            <button
              onClick={() => setTab('suggestion')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-4 text-sm font-bold transition-all ${
                tab === 'suggestion'
                  ? 'border-[#ff6b00] bg-[#ff6b00] text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-[#ff6b00]/50'
              }`}
            >
              <Lightbulb className="size-5" />
              Une suggestion
            </button>
          </div>

          {/* Panel Bug */}
          {tab === 'bug' && (
            <div className="rounded-3xl border-2 border-red-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-red-50 p-4">
                <Bug className="size-6 shrink-0 text-red-500" />
                <div>
                  <p className="font-bold text-red-700">Signaler un bug</p>
                  <p className="text-sm text-red-600">Décrivez ce qui ne fonctionne pas — nous corrigerons rapidement.</p>
                </div>
              </div>
              {bugSent ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-40"
                  >
                    <Send className="size-4" />
                    Signaler ce bug
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Panel Suggestion */}
          {tab === 'suggestion' && (
            <div className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
                <Lightbulb className="size-6 shrink-0 text-[#ff6b00]" />
                <div>
                  <p className="font-bold text-orange-700">Votre suggestion</p>
                  <p className="text-sm text-orange-600">Une idée pour améliorer Swift Africa ? Partagez-la avec nous.</p>
                </div>
              </div>
              {sugSent ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] py-3.5 text-sm font-bold text-white transition hover:bg-[#e55f00] disabled:opacity-40"
                  >
                    <Send className="size-4" />
                    Envoyer ma suggestion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
