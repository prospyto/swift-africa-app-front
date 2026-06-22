import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Swift Africa — Application',
  description: 'Votre espace Swift Africa',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
