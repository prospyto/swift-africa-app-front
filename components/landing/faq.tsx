'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: "Que se passe-t-il si je ne reçois pas ma commande ?",
    a: "Votre argent est bloqué en Escrow jusqu'à votre confirmation. Si vous ne recevez pas votre colis, vous ne donnez pas le code OTP — le vendeur n'est jamais payé. Vous êtes remboursé intégralement.",
  },
  {
    q: "Comment le livreur est-il payé ?",
    a: "Le livreur reçoit sa commission automatiquement après validation de l'OTP. Il n'a pas besoin d'attendre — le paiement est instantané dès la livraison confirmée.",
  },
  {
    q: "Puis-je vendre depuis n'importe quelle ville ?",
    a: "Oui. Toute personne disposant d'un compte vendeur peut mettre ses produits en ligne. Swift Africa prend en charge la mise en relation avec les livreurs disponibles dans votre zone.",
  },
  {
    q: "Comment retirer mon argent en tant que vendeur ?",
    a: "Après décaissement, les fonds arrivent directement dans votre wallet Swift Africa. Vous pouvez ensuite les transférer vers votre compte Mobile Money (MTN, Moov) — intégration en cours.",
  },
  {
    q: "L'application est-elle gratuite ?",
    a: "Oui, l'inscription et l'utilisation de Swift Africa sont entièrement gratuites. Aucune commission sur vos ventes pendant les 3 premiers mois.",
  },
]

export function FAQ() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <div
          className="mb-12 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-[#ff6b00]/10 px-4 py-1.5 text-sm font-semibold text-[#ff6b00]">
            FAQ
          </span>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s, outline 0.3s ease, border-color 0.3s ease`,
                borderColor: open === i ? '#ff6b00' : '#f3f4f6',
                outline: open === i ? '3px solid #ff6b0030' : '3px solid transparent',
                outlineOffset: '2px',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold">{faq.q}</span>
                <ChevronDown
                  className="size-5 shrink-0 text-gray-400 transition-transform duration-300"
                  style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <div
                style={{
                  maxHeight: open === i ? '300px' : '0',
                  transition: 'max-height 0.3s ease',
                  overflow: 'hidden',
                }}
              >
                <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
