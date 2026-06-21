'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Loader2, Navigation, Clock } from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { apiFetch } from '@/lib/api'

const MapComponent = dynamic(() => import('./gps-map'), {
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
      Chargement de la carte…
    </div>
  ),
  ssr: false,
})

interface Position {
  latitude: number
  longitude: number
  mise_a_jour_le?: string
}

interface Destination {
  latitude: number
  longitude: number
  address: string
}

export function DeliveryTracker({ missionId }: { missionId: number }) {
  const [position, setPosition] = useState<Position | null>(null)
  const [destination, setDestination] = useState<Destination | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [noPosition, setNoPosition] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const dest = await apiFetch<Destination>(`missions/${missionId}/destination/`)
      setDestination(dest)
    } catch { /* destination indispo */ }

    try {
      const pos = await apiFetch<Position>(`missions/${missionId}/position/`)
      setPosition(pos)
      setNoPosition(false)
      if (pos.mise_a_jour_le) setLastUpdate(pos.mise_a_jour_le)
    } catch {
      setNoPosition(true)
    } finally {
      setLoading(false)
    }
  }, [missionId])

  useEffect(() => {
    fetchData()
    // Polling toutes les 10s pour suivre le livreur en temps réel
    const interval = setInterval(fetchData, 10_000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Chargement de la carte…
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Navigation className={`size-4 ${noPosition ? 'text-muted-foreground' : 'text-success'}`} />
          <span className={noPosition ? 'text-muted-foreground' : 'font-semibold text-success'}>
            {noPosition ? 'En attente de la position du livreur…' : 'Livreur en route'}
          </span>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {new Date(lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Destination */}
      {destination && (
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs">
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span className="font-medium">Destination :</span>
          <span className="text-muted-foreground">{destination.address}</span>
        </div>
      )}

      {/* Carte */}
      {position && destination ? (
        <MapComponent
          currentLocation={position}
          destination={destination}
        />
      ) : noPosition && destination ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-muted text-center text-sm text-muted-foreground">
          <Navigation className="size-8 opacity-30" />
          <p>Le livreur n'a pas encore activé son GPS.</p>
          <p className="text-xs">La carte apparaîtra automatiquement.</p>
        </div>
      ) : null}
    </div>
  )
}
