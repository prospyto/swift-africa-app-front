'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, AlertCircle, CheckCircle2, Loader, Navigation } from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { apiFetch, isOfflineError } from '@/lib/api'

// Destination par défaut — Cotonou centre
const DEFAULT_DESTINATION = {
  latitude: 6.3703,
  longitude: 2.3912,
  address: 'Cotonou, Bénin',
}

const MapComponent = dynamic(() => import('./gps-map'), {
  loading: () => (
    <div className="h-96 bg-muted rounded-2xl flex items-center justify-center text-sm text-muted-foreground">
      Chargement de la carte…
    </div>
  ),
  ssr: false,
})

interface Destination {
  latitude: number
  longitude: number
  address: string
}

interface CurrentLocation {
  latitude: number
  longitude: number
}

export function GPSTracker({ missionId }: { missionId: number }) {
  const [location, setLocation] = useState<CurrentLocation | null>(null)
  const [destination, setDestination] = useState<Destination>(DEFAULT_DESTINATION)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tracking, setTracking] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Récupérer la destination depuis l'API
  useEffect(() => {
    let cancelled = false
    async function getDestination() {
      try {
        const dest = await apiFetch<Destination>(`missions/${missionId}/destination/`)
        if (!cancelled && dest?.latitude && dest?.longitude) {
          setDestination(dest)
        }
      } catch {
        // En cas d'erreur, on garde la destination par défaut
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    getDestination()
    return () => { cancelled = true }
  }, [missionId])

  // Tracking GPS
  useEffect(() => {
    if (!tracking || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })
        setDistance(calculateDistance(latitude, longitude, destination.latitude, destination.longitude))

        try {
          await apiFetch(`missions/${missionId}/position/`, {
            method: 'POST',
            body: { latitude, longitude },
          })
        } catch {
          // Silencieux
        }
      },
      (err) => {
        setError(`Erreur GPS : ${err.message}`)
        setTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [tracking, missionId, destination])

  function startTracking() {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par ce navigateur')
      return
    }
    setError('')
    setTracking(true)
  }

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center gap-3">
        <Loader className="size-5 animate-spin text-primary" />
        <span>Chargement…</span>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">

      {/* Contrôle GPS */}
      <GlassCard strong className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: tracking ? '#10b98120' : '#f3f4f6' }}
            >
              <Navigation
                className="size-5"
                style={{ color: tracking ? '#10b981' : '#6b7280' }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">GPS</p>
              <p className="font-semibold text-sm">
                {tracking ? '● Actif' : 'Inactif'}
              </p>
            </div>
          </div>
          <button
            onClick={() => tracking ? setTracking(false) : startTracking()}
            className="rounded-xl px-4 py-2 font-semibold text-sm transition"
            style={{
              backgroundColor: tracking ? '#ef4444' : '#ff6b00',
              color: 'white',
            }}
          >
            {tracking ? 'Arrêter' : 'Commencer'}
          </button>
        </div>

        {/* Distance */}
        {distance !== null && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-2">
            <span className="text-sm text-gray-600">Distance destination</span>
            <span className="font-bold text-orange-600">{distance.toFixed(2)} km</span>
          </div>
        )}
      </GlassCard>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Carte — s'affiche dès que le tracking est actif ET position obtenue */}
      {tracking && !location && (
        <div className="h-64 rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-3 text-gray-500">
          <Loader className="size-6 animate-spin" />
          <p className="text-sm">Acquisition du signal GPS…</p>
        </div>
      )}

      {/* Carte visible dès que location est disponible */}
      {location && (
        <>
          <MapComponent currentLocation={location} destination={destination} />

          {/* Info destination */}
          <GlassCard className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 shrink-0 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-semibold text-sm">{destination.address}</p>
                </div>
              </div>
              {distance !== null && distance < 0.5 && (
                <div className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                  <CheckCircle2 className="size-4" />
                  Arrivé !
                </div>
              )}
            </div>
          </GlassCard>
        </>
      )}

      {/* Instructions si pas encore démarré */}
      {!tracking && !location && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm">
          <p className="font-semibold mb-2 text-orange-800">Comment ça marche :</p>
          <ol className="list-decimal list-inside space-y-1.5 text-orange-700">
            <li>Appuie sur <strong>Commencer</strong></li>
            <li>Autorise l'accès à ta position</li>
            <li>La carte s'affiche automatiquement</li>
          </ol>
        </div>
      )}
    </div>
  )
}
