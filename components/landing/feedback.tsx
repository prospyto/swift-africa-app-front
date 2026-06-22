'use client'

import { useEffect, useRef, useState } from 'react'
import { Bug, Lightbulb, Send, CheckCircle2 } from 'lucide-react'

const EMAIL = 'swiftafrica@gmail.com'

type FeedbackType = 'bug' | 'suggestion'

export function Feedback() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [type, setType] = useState<FeedbackType>('bug')
  const [form, setForm] = useState({ nom: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  function handleSubmit() {
    const label = type === 'bug' ? '🐛 Bug signalé' : '💡 Suggestion'
    const subject = encodeURIComponent(`[Swift Africa] ${label} — ${form.nom}`)
    const body = encodeURIComponent(
      `Type : ${label}\nNom : ${form.nom}\nEmail : ${form.email}\n\nDescription :\n${form.message}`
    )
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`)
    setSent(true)
  }

  const valid = form.message.length >= 10

  return (
    <section ref={ref} className="bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <div
          className="mb-10 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
            Votre avis compte
          </span>
          <h2 className="mb-3 text-4xl font-black tracking-tight md:text-5xl">
            Aidez-nous à améliorer<br />Swift Africa
          </h2>
          <p className="text-gray-600">
            Vous avez rencontré un bug ou vous avez une idée ? Dites-le nous — chaque retour nous aide à construire une meilleure plateforme.
          </p>
        </div>

        <div
          className="rounded-3xl bg-white p-8 shadow-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          }}
        >
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 className="size-16 text-green-500" />
              <h3 className="text-xl font-bold">Merci pour votre retour !</h3>
              <p className="text-gray-600">Nous en tiendrons compte pour améliorer Swift Africa.</p>
              <button
                onClick={() => { setSent(false); setForm({ nom: '', email: '', message: '' }) }}
                className="text-sm text-[#ff6b00] hover:underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <>
              {/* Toggle Bug / Suggestion */}
              <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
                <button
                  onClick={() => setType('bug')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    type === 'bug' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Bug className="size-4" />
                  Signaler un bug
                </button>
                <button
                  onClick={() => setType('suggestion')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    type === 'suggestion' ? 'bg-white text-[#ff6b00] shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Lightbulb className="size-4" />
                  Une suggestion
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Nom (optionnel)</label>
                    <input
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Votre nom"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Email (optionnel)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Pour vous répondre"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    {type === 'bug' ? 'Décrivez le problème *' : 'Décrivez votre idée *'}
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={
                      type === 'bug'
                        ? 'Que s\'est-il passé ? Sur quelle page ? Quel appareil utilisez-vous ?'
                        : 'Quelle fonctionnalité souhaiteriez-vous voir ? Comment améliorerait-elle votre expérience ?'
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.message.length} caractères</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!valid}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40 ${
                    type === 'bug' ? 'bg-red-500' : 'bg-[#ff6b00]'
                  }`}
                >
                  <Send className="size-4" />
                  {type === 'bug' ? 'Signaler ce bug' : 'Envoyer ma suggestion'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
