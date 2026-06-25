import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Roles } from '@/components/landing/roles'
import { CatalogPreview } from '@/components/landing/catalog-preview'
import { Security } from '@/components/landing/security'
import { Stats } from '@/components/landing/stats'
import { Testimonials } from '@/components/landing/testimonials'
import { Roadmap } from '@/components/landing/roadmap'
import { Partnership } from '@/components/landing/partnership'
import { FAQ } from '@/components/landing/faq'
import { Feedback } from '@/components/landing/feedback'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* 1. ATTENTION — Accroche */}
      <Hero />

      {/* 2. DÉSIR — S'identifier */}
      <div id="roles"><Roles /></div>

      {/* 3. INTÉRÊT — Comprendre pour chaque acteur */}
      <HowItWorks />

      {/* 4. INTÉRÊT — Voir les produits */}
      <CatalogPreview />

      {/* 5. CONFIANCE — Sécurité pour tous */}
      <Security />

      {/* 6. CRÉDIBILITÉ — Chiffres */}
      <Stats />

      {/* 7. PREUVE SOCIALE — Témoignages */}
      <Testimonials />

      {/* 8. VISION — Ce qui arrive bientôt */}
      <div id="roadmap"><Roadmap /></div>

      {/* 9. ACTION — Investir */}
      <div id="partenariat"><Partnership /></div>

      {/* 10. LEVER LES FREINS */}
      <div id="faq"><FAQ /></div>

      {/* 11. ENGAGEMENT */}
      <div id="feedback"><Feedback /></div>

      {/* 12. FOOTER */}
      <Footer />
    </main>
  )
}

