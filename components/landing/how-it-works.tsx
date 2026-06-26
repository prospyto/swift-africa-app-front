'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Store, Bike, ScanLine, ShieldCheck, PackageCheck, ClipboardList, Wallet, MapPin, Navigation, QrCode, BadgeCheck } from 'lucide-react'

const TABS = [
  {
    key: 'acheteur',
    label: 'Acheteur',
    icon: ShoppingBag,
    color: '#3b82f6',
    steps: [
      {
        icon: ScanLine,
        number: '01',
        title: 'Choisissez un produit',
        desc: 'Parcourez le catalogue et passez commande en quelques secondes depuis votre téléphone.',
        color: '#3b82f6',
      },
      {
        icon: ShieldCheck,
        number: '02',
        title: 'Payez en sécurité',
        desc: "Votre argent est bloqué jusqu'à la réception. Personne ne touche à rien avant vous.",
        color: '#10b981',
      },
      {
        icon: PackageCheck,
        number: '03',
        title: 'Recevez et confirmez',
        desc: "Donnez le code OTP au livreur quand vous avez votre colis. Le vendeur est payé seulement à ce moment.",
        color: '#ff6b00',
      },
    ],
  },
  {
    key: 'vendeur',
    label: 'Vendeur',
    icon: Store,
    color: '#ff6b00',
    steps: [
      {
        icon: ClipboardList,
        number: '01',
        title: 'Créez votre boutique',
        desc: "Ajoutez vos produits en 3 minutes. Photos, prix, stock — tout se gère depuis votre téléphone.",
        color: '#ff6b00',
      },
      {
        icon: PackageCheck,
        number: '02',
        title: 'Préparez la commande',
        desc: "Dès qu'une commande arrive, préparez le colis et cliquez sur \"Prêt\". Un livreur est automatiquement assigné.",
        color: '#8b5cf6',
      },
      {
        icon: Wallet,
        number: '03',
        title: 'Soyez payé à la livraison',
        desc: "Dès que l'acheteur confirme la réception par OTP, votre paiement est libéré instantanément dans votre wallet.",
        color: '#10b981',
      },
    ],
  },
  {
    key: 'livreur',
    label: 'Livreur',
    icon: Bike,
    color: '#10b981',
    steps: [
      {
        icon: MapPin,
        number: '01',
        title: 'Acceptez une mission',
        desc: "Une notification arrive dès qu'une commande est disponible près de chez vous. Vous acceptez la mission en un clic.",
        color: '#10b981',
      },
      {
        icon: Navigation,
        number: '02',
        title: 'Récupérez et livrez',
        desc: "Le GPS intégré vous guide jusqu'au vendeur, puis jusqu'à l'acheteur. Zéro confusion.",
        color: '#3b82f6',
      },
      {
        icon: QrCode,
        number: '03',
        title: "Scannez l'OTP et soyez payé",
        desc: "L'acheteur vous donne son code. Vous le saisissez — votre commission tombe immédiatement dans votre wallet.",
        color: '#ff6b00',
      },
    ],
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const tab = TABS[activeTab]

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="mx-auto max-w-5xl">

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
            Comment ça marche
          </span>
          <h2 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Simple pour chaque acteur
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            Acheteur, vendeur ou livreur — Swift Africa est conçu pour vous simplifier la vie.
          </p>
        </div>

        {/* Onglets */}
        <div
          className="mb-10 flex justify-center gap-3"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.2s',
          }}
        >
          {TABS.map((t, i) => {
            const Icon = t.icon
            const isActive = activeTab === i
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(i)}
                className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300"
                style={{
                  backgroundColor: isActive ? t.color : '#f3f4f6',
                  color: isActive ? 'white' : '#6b7280',
                  boxShadow: isActive ? `0 8px 24px -6px ${t.color}60` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <Icon className="size-4" strokeWidth={2} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Étapes */}
        <div className="grid gap-6 md:grid-cols-3">
          {tab.steps.map((step, i) => (
            <div
              key={`${tab.key}-${i}`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
              }}
            >
              <div
                className="group relative rounded-3xl border-2 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${step.color}50`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {/* Numéro discret */}
                <span className="absolute right-6 top-6 text-6xl font-black text-gray-100">
                  {step.number}
                </span>
                {/* Icône */}
                <div
                  className="mb-5 flex size-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    backgroundColor: `${step.color}15`,
                    boxShadow: `0 8px 24px -4px ${step.color}30`,
                  }}
                >
                  <step.icon className="size-8" style={{ color: step.color }} strokeWidth={1.5} />
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="leading-relaxed text-gray-600">{step.desc}</p>

                {/* Connecteur */}
                {i < 2 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block">
                    <div
                      className="flex size-8 items-center justify-center rounded-full text-white text-xs font-bold shadow-md"
                      style={{ backgroundColor: tab.color }}
                    >
                      →
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



