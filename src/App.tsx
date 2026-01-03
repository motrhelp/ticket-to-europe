import { useEffect, useState, useRef } from 'react'
import { Container, AppBar, Toolbar, Typography, Box, Autocomplete, TextField } from '@mui/material'
import { MapContainer, TileLayer, useMap, Popup, Marker, GeoJSON, Polyline } from 'react-leaflet'
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

// Helper function to get line points between two cities (straight line)
function getLinePoints(city1: City, city2: City): [number, number][] {
  return [
    [city1.lat, city1.lng],
    [city2.lat, city2.lng]
  ]
}

// Helper function to check if two line segments intersect
// Uses the cross product method to determine if segments intersect
function doSegmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): boolean {
  // Helper function to calculate cross product
  const crossProduct = (o: [number, number], a: [number, number], b: [number, number]): number => {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  }

  // Check if point p3 and p4 are on opposite sides of line p1-p2
  const d1 = crossProduct(p1, p2, p3)
  const d2 = crossProduct(p1, p2, p4)
  
  // Check if point p1 and p2 are on opposite sides of line p3-p4
  const d3 = crossProduct(p3, p4, p1)
  const d4 = crossProduct(p3, p4, p2)
  
  // Segments intersect if points are on opposite sides of each line
  // Also handle collinear cases (when cross product is 0)
  const hasOppositeSigns = (a: number, b: number) => (a > 0 && b < 0) || (a < 0 && b > 0)
  
  if (hasOppositeSigns(d1, d2) && hasOppositeSigns(d3, d4)) {
    return true
  }
  
  // Handle collinear cases (segments on the same line)
  if (d1 === 0 && isPointOnSegment(p1, p2, p3)) return true
  if (d2 === 0 && isPointOnSegment(p1, p2, p4)) return true
  if (d3 === 0 && isPointOnSegment(p3, p4, p1)) return true
  if (d4 === 0 && isPointOnSegment(p3, p4, p2)) return true
  
  return false
}

// Helper function to check if a point is on a line segment
function isPointOnSegment(
  segStart: [number, number],
  segEnd: [number, number],
  point: [number, number]
): boolean {
  const minX = Math.min(segStart[0], segEnd[0])
  const maxX = Math.max(segStart[0], segEnd[0])
  const minY = Math.min(segStart[1], segEnd[1])
  const maxY = Math.max(segStart[1], segEnd[1])
  
  return (
    point[0] >= minX &&
    point[0] <= maxX &&
    point[1] >= minY &&
    point[1] <= maxY
  )
}

// Helper function to check if two straight lines intersect
function doLinesIntersect(
  line1Points: [number, number][],
  line2Points: [number, number][]
): boolean {
  // For straight lines, we just have two points each
  if (line1Points.length < 2 || line2Points.length < 2) {
    return false
  }
  
  return doSegmentsIntersect(
    line1Points[0],
    line1Points[1],
    line2Points[0],
    line2Points[1]
  )
}

// Helper function to check if a new line would cross any existing lines
function wouldLineCrossExisting(
  newCity1: City,
  newCity2: City,
  existingLines: Array<{ city1: City; city2: City }>
): boolean {
  const newLinePoints = getLinePoints(newCity1, newCity2)
  
  for (const existingLine of existingLines) {
    const existingLinePoints = getLinePoints(existingLine.city1, existingLine.city2)
    
    // Skip if lines share an endpoint (they're connected, not crossing)
    const sharesEndpoint =
      (newCity1.name === existingLine.city1.name || newCity1.name === existingLine.city2.name) ||
      (newCity2.name === existingLine.city1.name || newCity2.name === existingLine.city2.name)
    
    if (sharesEndpoint) {
      continue
    }
    
    if (doLinesIntersect(newLinePoints, existingLinePoints)) {
      return true
    }
  }
  
  return false
}

// Component to draw a line between two cities
function CityLine({ city1, city2, color = '#4caf50' }: { city1: City; city2: City; color?: string }) {
  const linePoints = getLinePoints(city1, city2)
  
  return (
    <Polyline
      positions={linePoints}
      pathOptions={{
        color: color,
        weight: 3,
        opacity: 0.7,
      }}
    />
  )
}

// Component for city marker with popup
function CityMarker({ 
  city, 
  isHighlighted, 
  isAvailable,
  isGuessed,
  isWrongGuess,
  openPopup,
  cashInfo,
  isStartingCity,
  onMarkerClick
}: { 
  city: { name: string; lat: number; lng: number }
  isHighlighted: boolean
  isAvailable: boolean
  isGuessed: boolean
  isWrongGuess: boolean
  openPopup: boolean
  cashInfo: number | null
  isStartingCity: boolean
  onMarkerClick: () => void
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
  
  if (isWrongGuess) {
    size = 12
    color = '#f44336' // red for wrong guesses
    borderColor = '#d32f2f'
  } else if (isGuessed) {
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

  // Determine popup content based on city state
  let popupContent = city.name
  if (isStartingCity && !isGuessed) {
    // First city - just name
    popupContent = city.name
  } else if (isGuessed && cashInfo !== null) {
    // Correctly guessed city - show name + cash earned
    popupContent = `${city.name} +${cashInfo}`
  } else if (isWrongGuess && cashInfo !== null) {
    // Wrong guess - show name + cash lost
    popupContent = `${city.name} ${cashInfo}`
  } else {
    // Default - just name
    popupContent = city.name
  }

  return (
    <Marker 
      ref={markerRef} 
      position={[city.lat, city.lng]} 
      icon={dotIcon}
      eventHandlers={{
        click: () => {
          if (onMarkerClick) {
            onMarkerClick()
          }
          if (markerRef.current) {
            markerRef.current.openPopup()
          }
        }
      }}
    >
      <Popup>{popupContent}</Popup>
    </Marker>
  )
}

function App() {
  const [selector] = useState(() => new CitySelector())
  const [startingCity, setStartingCity] = useState<City | null>(null)
  const [currentHighlightedCity, setCurrentHighlightedCity] = useState<City | null>(null)
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [guessedCities, setGuessedCities] = useState<City[]>([])
  const [wrongGuesses, setWrongGuesses] = useState<City[]>([])
  const [lastGuessedCity, setLastGuessedCity] = useState<City | null>(null)
  const [message, setMessage] = useState<string>('')
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null)
  const [autocompleteValue, setAutocompleteValue] = useState<string | null>(null)
  const [autocompleteInputValue, setAutocompleteInputValue] = useState<string>('')
  const [autocompleteKey, setAutocompleteKey] = useState<number>(0)
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null)
  const [rejectedArc, setRejectedArc] = useState<{ city1: City; city2: City } | null>(null)
  const [cash, setCash] = useState<number>(5)
  const [cityCashInfo, setCityCashInfo] = useState<Map<string, number>>(new Map()) // Track cash earned/lost per city
  const [clickedCity, setClickedCity] = useState<string | null>(null)

  // Calculate total distance of connected cities
  const totalDistance = guessedCities.length > 1
    ? guessedCities.reduce((total, city, index) => {
        if (index === 0) return total
        const previousCity = guessedCities[index - 1]
        return total + selector.calculateDistance(previousCity, city)
      }, 0)
    : 0

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
    
    // Find 10 closest cities to the starting city
    const closest = selector.findClosestCities(startCity, [startCity], 10)
    setAvailableCities(closest)
    
    // Show popup for starting city after a short delay
    setTimeout(() => {
      setClickedCity(startCity.name)
      setTimeout(() => setClickedCity(null), 100)
    }, 500)
  }, [selector])

  const handleGuess = (cityName: string | null) => {
    // Clear autocomplete by resetting key (forces re-render)
    setAutocompleteValue(null)
    setAutocompleteInputValue('')
    setAutocompleteKey(prev => prev + 1)
    
    // Refocus the input after clearing
    setTimeout(() => {
      if (autocompleteInputRef.current) {
        autocompleteInputRef.current.focus()
      }
    }, 0)
    
    if (!cityName || !currentHighlightedCity) {
      return
    }
    
    // Find the city object
    const guessedCity = europeanCitiesData.find(c => c.name === cityName)
    if (!guessedCity) return
    
    // Check if already guessed (correctly)
    if (guessedCities.some(c => c.name === cityName)) {
      setMessage(`You already guessed ${cityName}.`)
      setTimeout(() => setMessage(''), 2000)
      return
    }
    
    // Check if it's in the available cities (10 closest)
    const isAvailable = availableCities.some(c => c.name === cityName)
    
    if (!isAvailable) {
      // Incorrect guess - costs 25 cash and add to wrong guesses
      const newCash = cash - 25
      setCash(newCash)
      setWrongGuesses(prev => {
        // Only add if not already in the list
        if (!prev.some(c => c.name === cityName)) {
          return [...prev, guessedCity]
        }
        return prev
      })
      setMessage(`${cityName} is not in the 10 closest cities. -25 cash.`)
      setTimeout(() => setMessage(''), 2000)
      
      // Check if game over (cash went negative)
      if (newCash < 0) {
        setTimeout(() => {
          setMessage('Game Over! You ran out of cash.')
        }, 2000)
      }
      return
    }
    
    // Check if the new line (from currentHighlightedCity to guessedCity) would cross existing lines
    // Build list of existing lines (from guessedCities)
    const existingLines: Array<{ city1: City; city2: City }> = []
    for (let i = 0; i < guessedCities.length - 1; i++) {
      existingLines.push({
        city1: guessedCities[i],
        city2: guessedCities[i + 1],
      })
    }
    
    // Check if the new line (from currentHighlightedCity to guessedCity) would cross existing lines
    if (wouldLineCrossExisting(currentHighlightedCity, guessedCity, existingLines)) {
      // Line crossing attempt - costs 25 cash and add to wrong guesses
      const newCash = cash - 25
      setCash(newCash)
      setCityCashInfo(prev => {
        const newMap = new Map(prev)
        newMap.set(cityName, -25)
        return newMap
      })
      setWrongGuesses(prev => {
        // Only add if not already in the list
        if (!prev.some(c => c.name === cityName)) {
          return [...prev, guessedCity]
        }
        return prev
      })
      // Show the rejected line in red for visual feedback
      setRejectedArc({ city1: currentHighlightedCity, city2: guessedCity })
      setMessage(`This path would cross an existing route. -25 cash.`)
      setTimeout(() => setMessage(''), 3000)
      // Clear the rejected line after 3 seconds
      setTimeout(() => {
        setRejectedArc(null)
      }, 3000)
      
      // Check if game over (cash went negative)
      if (newCash < 0) {
        setTimeout(() => {
          setMessage('Game Over! You ran out of cash.')
        }, 3000)
      }
      return
    }
    
    // Correct guess - add to guessed cities and add 5 cash
    const newGuessedCities = [...guessedCities, guessedCity]
    setGuessedCities(newGuessedCities)
    setLastGuessedCity(guessedCity)
    
    // Add 5 cash for building a route
    setCash(prev => prev + 5)
    setCityCashInfo(prev => {
      const newMap = new Map(prev)
      newMap.set(cityName, 5)
      return newMap
    })
    
    // Update highlighted city to the guessed city
    setCurrentHighlightedCity(guessedCity)
    
    // Find 10 closest cities to the newly guessed city (excluding all guessed cities)
    const closestCities = selector.findClosestCities(guessedCity, newGuessedCities, 10)
    // Add wrong guesses to available cities (they remain available even if not in 10 closest)
    const wrongGuessesNotInClosest = wrongGuesses.filter(
      wg => !closestCities.some(c => c.name === wg.name) && !newGuessedCities.some(c => c.name === wg.name)
    )
    setAvailableCities([...closestCities, ...wrongGuessesNotInClosest])
    
    // Show success message
    setMessage(`Great! Connected to ${cityName}. +5 cash.`)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Ticket to Europe
          </Typography>
          <Typography variant="h6" component="div" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {totalDistance > 0 ? `${Math.round(totalDistance)} km` : '0 km'}
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: cash < 0 ? '#f44336' : 'inherit' }}>
            ${cash}
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
            {/* Draw lines between consecutive guessed cities */}
            {guessedCities.length > 1 && guessedCities.map((city, index) => {
              if (index === 0) return null // Skip first city (no previous city to connect)
              const previousCity = guessedCities[index - 1]
              return (
                <CityLine key={`line-${previousCity.name}-${city.name}`} city1={previousCity} city2={city} />
              )
            })}
            {/* Draw rejected line in red (temporary visual feedback) */}
            {rejectedArc && (
              <CityLine city1={rejectedArc.city1} city2={rejectedArc.city2} color="#f44336" />
            )}
            {europeanCitiesData.map((city) => {
              const isStartingCity = startingCity?.name === city.name && guessedCities.length === 0
              const isHighlighted = currentHighlightedCity?.name === city.name && !isStartingCity
              const isAvailable = availableCities.some(c => c.name === city.name)
              const isGuessed = guessedCities.some(c => c.name === city.name) || isStartingCity
              const isWrongGuess = wrongGuesses.some(c => c.name === city.name)
              const cashInfo = cityCashInfo.get(city.name) || null
              const openPopup = lastGuessedCity?.name === city.name || clickedCity === city.name
              
              return (
                <CityMarker 
                  key={city.name} 
                  city={city} 
                  isHighlighted={isHighlighted}
                  isAvailable={isAvailable}
                  isGuessed={isGuessed}
                  isWrongGuess={isWrongGuess}
                  openPopup={openPopup}
                  cashInfo={cashInfo}
                  isStartingCity={isStartingCity}
                  onMarkerClick={() => {
                    setClickedCity(city.name)
                    setTimeout(() => setClickedCity(null), 500)
                  }}
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
            key={autocompleteKey}
            value={autocompleteValue}
            inputValue={autocompleteInputValue}
            options={europeanCities}
            onChange={(_, value) => handleGuess(value)}
            onInputChange={(_, newInputValue) => {
              setAutocompleteInputValue(newInputValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={(input) => {
                  autocompleteInputRef.current = input
                  if (params.inputProps?.ref) {
                    if (typeof params.inputProps.ref === 'function') {
                      params.inputProps.ref(input)
                    } else {
                      (params.inputProps.ref as any).current = input
                    }
                  }
                }}
                autoFocus
                label={currentHighlightedCity ? `Guess one of the 10 closest cities to ${currentHighlightedCity.name}` : 'Search European Cities'}
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
