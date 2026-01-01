import { useEffect, useState } from 'react'
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'
import './App.css'

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to handle map size updates
function MapResizeHandler() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  return null
}

function App() {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null)

  useEffect(() => {
    fetch('/europe.geojson')
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data))
      .catch((error) => console.error('Error loading GeoJSON:', error))
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Ticket to Europe
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xs" sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, height: '100%', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
          <MapContainer
            center={[54.5, 15.0]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
          >
            <MapResizeHandler />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJsonData && <GeoJSON data={geoJsonData} />}
          </MapContainer>
        </Box>
      </Container>
    </Box>
  )
}

export default App
