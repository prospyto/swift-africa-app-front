'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Send, CheckCircle2, ChevronDown } from 'lucide-react'

const EMAIL = 'swiftafrica@gmail.com'

export function Partnership() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', type: 'investisseur', montant: '', message: '',
  })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  function handleSubmit() {
    const subject = encodeURIComponent(`[Partenariat Swift Africa] ${form.type} — ${form.nom}`)
    const body = encodeURIComponent(
      `Nom : ${form.nom}\nEmail : ${form.email}\nTéléphone : ${form.telephone}\nType : ${form.type}\nMontant envisagé : ${form.montant} FCFA\n\nMessage :\n${form.message}`
    )
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`)
    setSent(true)
  }

  const valid = form.nom && form.email && form.message

  return (
    <section ref={ref} className="bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div
          className="mb-12 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            💼 Partenariat
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Investissez dans<br />
            <span className="text-[#ff6b00]">l'avenir du commerce africain</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Swift Africa cherche ses premiers actionnaires et partenaires stratégiques pour déployer la plateforme à grande échelle en Afrique de l'Ouest.
          </p>
        </div>

        {/* Pourquoi investir */}
        <div
          className="mb-8 rounded-3xl bg-gradient-to-br from-[#ff6b00] to-[#ff8c00] p-8 text-white"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          }}
        >
          <TrendingUp className="mb-4 size-10 opacity-90" />
          <h3 className="mb-4 text-2xl font-black">Pourquoi nous rejoindre ?</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Marché du e-commerce africain en croissance de 25% par an',
              'Technologie prête — plateforme fonctionnelle dès aujourd\'hui',
              'Système Escrow unique en Afrique de l\'Ouest',
              'Équipe dédiée et vision long terme',
              'Retour sur investissement dès la phase de déploiement',
              'Présence dans 6 pays au lancement',
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-bold">✓</span>
                <span className="text-white/90">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton Nous contacter → dévoile formulaire */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}
        >
          <button
            onClick={() => setShowForm((v) => !v)}
            className="wave-btn mx-auto mb-6 flex items-center gap-3 rounded-2xl bg-[#ff6b00] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#ff6b00]/30 transition hover:bg-[#e55f00] overflow-hidden relative"
          >
            Nous contacter
            <ChevronDown
              className="size-5 transition-transform duration-300"
              style={{ transform: showForm ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </button>

          {/* Formulaire dépliable */}
          <div
            style={{
              maxHeight: showForm ? '800px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.5s ease',
            }}
          >
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              {sent ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <CheckCircle2 className="size-16 text-green-500" />
                  <h3 className="text-xl font-bold">Message envoyé !</h3>
                  <p className="text-gray-600">Nous vous répondrons dans les 48 heures.</p>
                  <button onClick={() => setSent(false)} className="text-sm text-[#ff6b00] hover:underline">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="mb-6 text-xl font-black">Votre candidature</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Nom complet *</label>
                        <input
                          value={form.nom}
                          onChange={(e) => setForm({ ...form, nom: e.target.value })}
                          placeholder="Jean Dupont"
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Téléphone</label>
                        <input
                          value={form.telephone}
                          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                          placeholder="+229 XX XX XX XX"
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="vous@exemple.com"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Type de partenariat</label>
                        <select
                          value={form.type}
                          onChange={(e) => setForm({ ...form, type: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00]"
                        >
                          <option value="investisseur">Investisseur</option>
                          <option value="actionnaire">Actionnaire</option>
                          <option value="sponsor">Sponsor</option>
                          <option value="strategique">Partenaire stratégique</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Montant envisagé (FCFA)</label>
                        <input
                          value={form.montant}
                          onChange={(e) => setForm({ ...form, montant: e.target.value })}
                          placeholder="Ex: 500 000"
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-600">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Parlez-nous de votre intérêt et de vos attentes..."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20"
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!valid}
                      className="wave-btn flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] py-3.5 text-sm font-bold text-white transition hover:bg-[#e55f00] disabled:opacity-40 overflow-hidden relative"
                    >
                      <Send className="size-4" />
                      Envoyer ma candidature
                    </button>
                    <p className="text-center text-xs text-gray-400">
                      Réponse garantie sous 48h — swiftafrica@gmail.com
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
