import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { AppProvider } from '@/lib/store'
import { AppShell } from '@/components/app-shell'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://swift-africa-backend.onrender.com/api/'

type Params = { params: Promise<{ slug: string }> }

interface BoutiquePublique {
  nom: string
  description?: string
  logo_url?: string | null
  banniere_url?: string | null
}

async function charger(slug: string): Promise<BoutiquePublique | null> {
  try {
    const r = await fetch(`${API}boutiques/${encodeURIComponent(slug)}/`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000), // le serveur gratuit peut dormir : on ne bloque pas la page
    })
    return r.ok ? ((await r.json()) as BoutiquePublique) : null
  } catch {
    return null
  }
}

/** Aperçu quand le lien est collé dans WhatsApp, Facebook… */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const b = await charger(slug)
  if (!b) return { title: 'Boutique — Swift Africa' }
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const base = host ? `https://${host}` : undefined
  const image = b.banniere_url || b.logo_url || undefined
  const description = b.description?.trim() || `Découvrez la boutique ${b.nom} sur Swift Africa.`
  return {
    title: `${b.nom} — Swift Africa`,
    description,
    ...(base ? { metadataBase: new URL(base), alternates: { canonical: `/boutique/${slug}` } } : {}),
    openGraph: {
      title: b.nom,
      description,
      type: 'website',
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: b.nom, description },
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  return (
    <AppProvider>
      <AppShell initialBoutique={slug} />
    </AppProvider>
  )
}
