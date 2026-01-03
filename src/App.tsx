import { useEffect, useState, useRef } from 'react'
import { Container, AppBar, Toolbar, Typography, Box, Autocomplete, TextField } from '@mui/material'
import { MapContainer, TileLayer, useMap, Popup, Marker, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'
import { europeanCitiesData, europeanCities } from './data/europeanCities'
import { CitySelector } from './game/CitySelector'
import type { City } from './data/europeanCities'
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

// Component for city marker with popup
function CityMarker({ 
  city, 
  isHighlighted, 
  isAvailable,
  isGuessed,
  openPopup
}: { 
  city: { name: string; lat: number; lng: number }
  isHighlighted: boolean
  isAvailable: boolean
  isGuessed: boolean
  openPopup: boolean
}) {
  const markerRef = useRef<L.Marker>(null)
  
  useEffect(() => {
    if (openPopup && markerRef.current) {
      // Small delay to ensure marker is fully initialized
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [openPopup])
  
  let size = 6
  let color = '#cccccc' // gray for unavailable cities
  let borderColor = '#999999'
  
  if (isGuessed) {
    size = 14
    color = '#4caf50' // green for guessed cities
    borderColor = '#2e7d32'
  } else if (isHighlighted) {
    size = 16
    color = '#FF6B35' // Dutch Orange for highlighted city (current target)
    borderColor = '#E55A2B'
  } else if (isAvailable) {
    size = 12
    color = '#2196F3' // blue for available cities
    borderColor = '#1976D2'
  }
  
  const dotIcon = L.divIcon({
    className: 'custom-dot-icon',
    html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; border: 2px solid ${borderColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

  return (
    <Marker ref={markerRef} position={[city.lat, city.lng]} icon={dotIcon}>
      <Popup>{city.name}</Popup>
    </Marker>
  )
}

function App() {
  const [selector] = useState(() => new CitySelector())
  const [startingCity, setStartingCity] = useState<City | null>(null)
  const [currentHighlightedCity, setCurrentHighlightedCity] = useState<City | null>(null)
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [guessedCities, setGuessedCities] = useState<City[]>([])
  const [lastGuessedCity, setLastGuessedCity] = useState<City | null>(null)
  const [message, setMessage] = useState<string>('')
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null)

  // Load GeoJSON data
  useEffect(() => {
    fetch('/europe.geojson')
      .then(response => response.json())
      .then(data => setGeoJsonData(data as GeoJsonObject))
      .catch(error => console.error('Error loading GeoJSON:', error))
  }, [])

  // Initialize game with starting city
  useEffect(() => {
    const startCity = selector.getCityOfTheDay()
    setStartingCity(startCity)
    setCurrentHighlightedCity(startCity)
    
    // Add starting city to guessed cities so it's not offered again
    setGuessedCities([startCity])
    
    // Find 3 closest cities to the starting city
    const closest = selector.findClosestCities(startCity, [startCity], 3)
    setAvailableCities(closest)
    
    // Show popup for starting city after a short delay
    setTimeout(() => {
      setLastGuessedCity(startCity)
    }, 500)
  }, [selector])

  const handleGuess = (cityName: string | null) => {
    if (!cityName || !currentHighlightedCity) return
    
    // Find the city object
    const guessedCity = europeanCitiesData.find(c => c.name === cityName)
    if (!guessedCity) return
    
    // Check if it's in the available cities
    const isAvailable = availableCities.some(c => c.name === cityName)
    if (!isAvailable) {
      setMessage(`${cityName} is not available. Choose one of the highlighted cities.`)
      setTimeout(() => setMessage(''), 2000)
      return
    }
    
    // Check if already guessed
    if (guessedCities.some(c => c.name === cityName)) {
      setMessage(`You already guessed ${cityName}.`)
      setTimeout(() => setMessage(''), 2000)
      return
    }
    
    // Add to guessed cities
    const newGuessedCities = [...guessedCities, guessedCity]
    setGuessedCities(newGuessedCities)
    setLastGuessedCity(guessedCity)
    
    // Update highlighted city to the guessed city
    setCurrentHighlightedCity(guessedCity)
    
    // Find 3 closest cities to the newly guessed city (excluding all guessed cities)
    const newAvailableCities = selector.findClosestCities(guessedCity, newGuessedCities, 3)
    setAvailableCities(newAvailableCities)
    
    // Show success message
    setMessage(`Great! Now guess one of the 3 closest cities to ${cityName}`)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Ticket to Europe
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, height: '100%', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
          <MapContainer
            center={[54.5, 15.0]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
          >
            <MapResizeHandler />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            />
            {geoJsonData && (
              <GeoJSON
                data={geoJsonData}
                style={() => ({
                  color: '#666666',
                  weight: 1,
                  fillColor: 'transparent',
                  fillOpacity: 0,
                })}
              />
            )}
            {europeanCitiesData.map((city) => {
              const isStartingCity = startingCity?.name === city.name && guessedCities.length === 0
              const isHighlighted = currentHighlightedCity?.name === city.name && !isStartingCity
              const isAvailable = availableCities.some(c => c.name === city.name)
              const isGuessed = guessedCities.some(c => c.name === city.name) || isStartingCity
              
              return (
                <CityMarker 
                  key={city.name} 
                  city={city} 
                  isHighlighted={isHighlighted}
                  isAvailable={isAvailable}
                  isGuessed={isGuessed}
                  openPopup={lastGuessedCity?.name === city.name}
                />
              )
            })}
          </MapContainer>
          {message && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '800px',
                zIndex: 1001,
                backgroundColor: 'background.paper',
                padding: '16px 24px',
                borderRadius: 2,
                boxShadow: 3,
                textAlign: 'center',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}
              >
                {message}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            zIndex: 1000,
            backgroundColor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <Autocomplete
            options={europeanCities}
            onChange={(_, value) => handleGuess(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={currentHighlightedCity ? `Guess a city near ${currentHighlightedCity.name}` : 'Search European Cities'}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.2rem',
                    padding: '12px',
                    minHeight: '56px',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '1.1rem',
                  },
                }}
              />
            )}
            sx={{
              '& .MuiAutocomplete-inputRoot': {
                fontSize: '1.2rem',
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  )
}

export default App
