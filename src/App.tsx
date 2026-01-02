import { useEffect, useState, useRef } from 'react'
import { Container, AppBar, Toolbar, Typography, Box, Autocomplete, TextField } from '@mui/material'
import { MapContainer, TileLayer, useMap, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'
import { europeanCities, europeanCitiesData } from './data/europeanCities'
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
  isTargetCity, 
  isCorrectGuess,
  isIncorrectGuess,
  openPopup
}: { 
  city: { name: string; lat: number; lng: number }
  isTargetCity: boolean
  isCorrectGuess: boolean
  isIncorrectGuess: boolean
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
  
  let size = 8
  let color = '#1976d2' // default blue
  
  if (isCorrectGuess) {
    size = 14
    color = '#4caf50' // green for correct guess
  } else if (isIncorrectGuess) {
    size = 12
    color = '#f44336' // red for incorrect guess
  } else if (isTargetCity) {
    size = 14
    color = '#FF6B35' // Dutch Orange for target city (not yet guessed)
  }
  
  const dotIcon = L.divIcon({
    className: 'custom-dot-icon',
    html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; border: 1px solid ${color};"></div>`,
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
  const [cityOfTheDay, setCityOfTheDay] = useState<City | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string>('')
  const [guesses, setGuesses] = useState<string[]>([])
  const [lastGuessedCity, setLastGuessedCity] = useState<string | null>(null)

  useEffect(() => {
    const selector = new CitySelector()
    setCityOfTheDay(selector.getCityOfTheDay())
  }, [])

  const handleGuess = (cityName: string | null) => {
    if (!cityName || !cityOfTheDay) return
    
    // Don't add duplicate guesses
    if (guesses.includes(cityName)) return
    
    setLastGuessedCity(cityName)
    setGuesses(prev => [...prev, cityName])
    
    if (cityName === cityOfTheDay.name) {
      setIsCorrect(true)
      setMessage(`You guessed ${cityOfTheDay.name} correctly!`)
    } else {
      setIsCorrect(false)
      setMessage(`It's not ${cityName}, try again`)
    }
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
            {europeanCitiesData.map((city) => (
              <CityMarker 
                key={city.name} 
                city={city} 
                isTargetCity={cityOfTheDay?.name === city.name && !isCorrect}
                isCorrectGuess={isCorrect === true && cityOfTheDay?.name === city.name}
                isIncorrectGuess={guesses.includes(city.name) && city.name !== cityOfTheDay?.name}
                openPopup={lastGuessedCity === city.name}
              />
            ))}
          </MapContainer>
          {message && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
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
                  color: isCorrect ? 'success.main' : 'error.main',
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
                label="Search European Cities"
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
