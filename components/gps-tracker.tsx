'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, AlertCircle, CheckCircle2, Loader } from 'lucide-react'
import { GlassCard } from '@/components/glass'
import { apiFetch, isOfflineError } from '@/lib/api'

const MapComponent = dynamic(() => import('./gps-map'), {
  loading: () => (
    <div className="h-96 bg-muted rounded-2xl flex items-center justify-center">
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
  const [destination, setDestination] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tracking, setTracking] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)

  // Distance entre deux coordonnées (formule de Haversine)
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371 // rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    let cancelled = false

    async function getDestination() {
      try {
        const dest = await apiFetch<Destination>(`missions/${missionId}/destination/`)
        if (!cancelled) setDestination(dest)
      } catch (err) {
        if (isOfflineError(err)) {
          // Mode démo : destination fictive sur Cotonou
          if (!cancelled) {
            setDestination({
              latitude: 6.3703,
              longitude: 2.3912,
              address: 'Cotonou, Bénin',
            })
          }
        } else if (!cancelled) {
          setError((err as Error).message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    getDestination()
    return () => {
      cancelled = true
    }
  }, [missionId])

  useEffect(() => {
    if (!tracking || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })

        if (destination) {
          setDistance(
            calculateDistance(
              latitude,
              longitude,
              destination.latitude,
              destination.longitude,
            ),
          )
        }

        try {
          await apiFetch(`missions/${missionId}/position/`, {
            method: 'POST',
            body: { latitude, longitude },
          })
        } catch {
          // Échec d'envoi silencieux : la position locale reste affichée,
          // on retentera à la prochaine mise à jour de watchPosition.
        }
      },
      (err) => {
        setError(`Erreur de géolocalisation : ${err.message}`)
        setTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
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

  function stopTracking() {
    setTracking(false)
  }

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center gap-3">
        <Loader className="size-5 animate-spin text-primary" />
        <span>Chargement de la destination…</span>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-5">
      <GlassCard strong className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">État du suivi</p>
              <p className="font-semibold">
                {tracking ? 'GPS actif' : 'GPS inactif'}
              </p>
            </div>
          </div>
          <button
            onClick={() => (tracking ? stopTracking() : startTracking())}
            className={`rounded-xl px-4 py-2 font-semibold text-sm transition ${
              tracking
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {tracking ? 'Arrêter' : 'Commencer'}
          </button>
        </div>
      </GlassCard>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {location && (
        <GlassCard className="p-5">
          <p className="text-xs text-muted-foreground mb-2">Votre position</p>
          <div className="space-y-1 text-sm">
            <p>Latitude : {location.latitude.toFixed(6)}°</p>
            <p>Longitude : {location.longitude.toFixed(6)}°</p>
            {distance !== null && (
              <p className="font-semibold text-primary">
                Distance : {distance.toFixed(2)} km
              </p>
            )}
          </div>
        </GlassCard>
      )}

      {destination && (
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <p className="font-semibold">{destination.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {destination.latitude.toFixed(6)}°, {destination.longitude.toFixed(6)}°
              </p>
            </div>
            {distance !== null && distance < 0.5 && (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
                <CheckCircle2 className="size-4" />
                Arrivé !
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {location && destination && (
        <MapComponent currentLocation={location} destination={destination} />
      )}

      {!tracking && !location && (
        <div className="rounded-xl bg-accent/10 p-4 text-sm text-accent-foreground">
          <p className="font-semibold mb-2">Pour commencer :</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Appuyez sur « Commencer » pour activer le GPS</li>
            <li>Acceptez l&apos;accès à votre position</li>
            <li>Votre position s&apos;affichera sur la carte</li>
          </ol>
        </div>
      )}
    </div>
  )
}
