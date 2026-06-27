'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const destinationIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface Location {
  latitude: number
  longitude: number
}

interface MapProps {
  currentLocation: Location
  destination: Location & { address: string }
}

export default function GPSMap({ currentLocation, destination }: MapProps) {
  // Un ref DOM direct plutôt qu'un id généré par useId — Leaflet a
  // besoin de l'élément réellement peint avant de s'initialiser ; un
  // id pouvait pointer vers un nœud pas encore présent selon le
  // timing de next/dynamic, faisant échouer L.map() silencieusement
  // et ne laissant que les coordonnées brutes affichées en texte.
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const livreurMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [currentLocation.latitude, currentLocation.longitude],
      zoom: 15,
      scrollWheelZoom: true,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const livreurMarker = L.marker(
      [currentLocation.latitude, currentLocation.longitude],
      { icon: markerIcon, title: 'Position du livreur' },
    )
      .bindPopup('Position actuelle du livreur')
      .addTo(map)
    livreurMarkerRef.current = livreurMarker

    const destMarker = L.marker(
      [destination.latitude, destination.longitude],
      { icon: destinationIcon, title: destination.address },
    )
      .bindPopup(`Destination : ${destination.address}`)
      .addTo(map)

    L.polyline(
      [
        [currentLocation.latitude, currentLocation.longitude],
        [destination.latitude, destination.longitude],
      ],
      { color: '#FF6B00', weight: 3, opacity: 0.7 },
    ).addTo(map)

    const group = new L.FeatureGroup([livreurMarker, destMarker])
    map.fitBounds(group.getBounds().pad(0.1))

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Le livreur se déplace : déplace le marqueur + recentre la carte,
  // sans tout réinitialiser (effet séparé pour éviter de recréer la
  // carte à chaque mise à jour de position).
  useEffect(() => {
    if (!mapRef.current || !livreurMarkerRef.current) return
    const newPos: L.LatLngExpression = [currentLocation.latitude, currentLocation.longitude]
    livreurMarkerRef.current.setLatLng(newPos)
    mapRef.current.panTo(newPos)
  }, [currentLocation.latitude, currentLocation.longitude])

  return <div ref={containerRef} className="h-96 rounded-2xl overflow-hidden border border-border" />
}
