import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Roles } from '@/components/landing/roles'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Hero />
      <HowItWorks />
      <Roles />
    </main>
  )
}
