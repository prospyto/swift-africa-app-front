import { Truck, MessageCircle, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

const WHATSAPP = '2290190685684'
const PHONE = '+22901906856 84'
const EMAIL = 'swiftafrica@gmail.com'

const PAYS = ['🇧🇯 Bénin', '🇨🇮 Côte d\'Ivoire', '🇸🇳 Sénégal', '🇲🇱 Mali', '🇹🇬 Togo', '🇳🇪 Niger']

export function Footer() {
  return (
    <footer className="bg-gray-900 px-4 pt-16 pb-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 grid gap-8 md:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#ff6b00]">
                <Truck className="size-6" />
              </div>
              <span className="text-xl font-black">Swift Africa</span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              La plateforme de commerce sécurisé pour l'Afrique de l'Ouest. Paiement bloqué jusqu'à la livraison. Zéro arnaque.
            </p>
            {/* Contact */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-green-700"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${WHATSAPP}`}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20"
              >
                <Phone className="size-4" />
                Appel direct — {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20"
              >
                <Mail className="size-4" />
                {EMAIL}
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Navigation</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/app" className="hover:text-[#ff6b00] transition">Accéder à l'application</Link></li>
              <li><Link href="/app" className="hover:text-[#ff6b00] transition">Créer un compte</Link></li>
              <li><Link href="/#roles" className="hover:text-[#ff6b00] transition">Qui sommes-nous</Link></li>
              <li><Link href="/#partenariat" className="hover:text-[#ff6b00] transition">Devenir partenaire</Link></li>
              <li><Link href="/#faq" className="hover:text-[#ff6b00] transition">FAQ</Link></li>
              <li><Link href="/#feedback" className="hover:text-[#ff6b00] transition">Signaler un bug</Link></li>
            </ul>
          </div>

          {/* Pays */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">🌍 Zones couvertes</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {PAYS.map((pays, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={i > 0 ? 'text-gray-500 text-xs' : 'font-semibold text-white'}>
                    {pays}
                  </span>
                  {i > 0 && <span className="text-xs text-gray-500">— bientôt</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between">
            <p className="text-sm text-gray-500">
              © 2026 Swift Africa. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-600">
              🔒 Plateforme sécurisée par système Escrow — vos fonds sont protégés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
