'use client'

import { useEffect, useId, useRef } from 'react'
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
  // Unique id so multiple maps can coexist without colliding on the DOM node.
  const mapId = useId().replace(/[:]/g, '')
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const map = L.map(mapId, {
      center: [currentLocation.latitude, currentLocation.longitude],
      zoom: 15,
      scrollWheelZoom: true,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.marker([currentLocation.latitude, currentLocation.longitude], {
      icon: markerIcon,
      title: 'Position du livreur',
    })
      .bindPopup('Position actuelle du livreur')
      .addTo(map)

    L.marker([destination.latitude, destination.longitude], {
      icon: destinationIcon,
      title: destination.address,
    })
      .bindPopup(`Destination : ${destination.address}`)
      .addTo(map)

    L.polyline(
      [
        [currentLocation.latitude, currentLocation.longitude],
        [destination.latitude, destination.longitude],
      ],
      { color: '#FF6B00', weight: 3, opacity: 0.7 },
    ).addTo(map)

    const group = new L.FeatureGroup([
      L.marker([currentLocation.latitude, currentLocation.longitude]),
      L.marker([destination.latitude, destination.longitude]),
    ])
    map.fitBounds(group.getBounds().pad(0.1))

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [mapId, currentLocation, destination])

  return <div id={mapId} className="h-96 rounded-2xl overflow-hidden border border-border" />
}
