import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Security } from '@/components/landing/security'
import { Roles } from '@/components/landing/roles'
import { Stats } from '@/components/landing/stats'
import { Partnership } from '@/components/landing/partnership'
import { FAQ } from '@/components/landing/faq'
import { Feedback } from '@/components/landing/feedback'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Hero />
      <HowItWorks />
      <Security />
      <div id="roles"><Roles /></div>
      <Stats />
      <div id="partenariat"><Partnership /></div>
      <div id="faq"><FAQ /></div>
      <div id="feedback"><Feedback /></div>
      <Footer />
    </main>
  )
}
