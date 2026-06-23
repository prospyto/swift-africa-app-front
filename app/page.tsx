import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Roles } from '@/components/landing/roles'
import { CatalogPreview } from '@/components/landing/catalog-preview'
import { Security } from '@/components/landing/security'
import { Stats } from '@/components/landing/stats'
import { Partnership } from '@/components/landing/partnership'
import { FAQ } from '@/components/landing/faq'
import { Feedback } from '@/components/landing/feedback'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* 1. ATTENTION — Accroche */}
      <Hero />

      {/* 2. INTÉRÊT — Comprendre d'abord */}
      <HowItWorks />

      {/* 3. DÉSIR — S'identifier */}
      <div id="roles"><Roles /></div>

      {/* 4. INTÉRÊT — Voir les produits */}
      <CatalogPreview />

      {/* 5. CONFIANCE — Être rassuré */}
      <Security />

      {/* 6. CRÉDIBILITÉ — Chiffres */}
      <Stats />

      {/* 7. ACTION — Investir */}
      <div id="partenariat"><Partnership /></div>

      {/* 8. LEVER LES FREINS */}
      <div id="faq"><FAQ /></div>

      {/* 9. ENGAGEMENT */}
      <div id="feedback"><Feedback /></div>

      {/* 10. FOOTER */}
      <Footer />
    </main>
  )
}
