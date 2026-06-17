'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    // Initialize map
    const map = L.map('map', {
      center: [currentLocation.latitude, currentLocation.longitude],
      zoom: 15,
      scrollWheelZoom: true,
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add markers
    L.marker([currentLocation.latitude, currentLocation.longitude], {
      icon: markerIcon,
      title: 'Votre position',
    })
      .bindPopup('Votre position actuelle')
      .addTo(map)

    L.marker([destination.latitude, destination.longitude], {
      icon: destinationIcon,
      title: destination.address,
    })
      .bindPopup(`Destination: ${destination.address}`)
      .addTo(map)

    // Draw line between current and destination
    const polyline = L.polyline(
      [
        [currentLocation.latitude, currentLocation.longitude],
        [destination.latitude, destination.longitude],
      ],
      { color: '#FF6B00', weight: 3, opacity: 0.7 },
    ).addTo(map)

    // Fit bounds to show both markers
    const group = new L.FeatureGroup([
      L.marker([currentLocation.latitude, currentLocation.longitude]),
      L.marker([destination.latitude, destination.longitude]),
    ])
    map.fitBounds(group.getBounds().pad(0.1))

    // Cleanup
    return () => {
      map.remove()
    }
  }, [currentLocation, destination])

  return <div id="map" className="h-96 rounded-2xl overflow-hidden border border-border" />
}
