// Comprehensive list of European cities with coordinates
export interface City {
  name: string
  lat: number
  lng: number
}

// Sanitized list: Capital + 2 largest cities per country
export const europeanCitiesData: City[] = [
  // United Kingdom
  { name: 'London', lat: 51.5074, lng: -0.1278 }, // Capital
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
  
  // France
  { name: 'Paris', lat: 48.8566, lng: 2.3522 }, // Capital
  { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  
  // Germany
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 }, // Capital
  { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
  { name: 'Munich', lat: 48.1351, lng: 11.5820 },
  
  // Italy
  { name: 'Rome', lat: 41.9028, lng: 12.4964 }, // Capital
  { name: 'Milan', lat: 45.4642, lng: 9.1900 },
  { name: 'Naples', lat: 40.8518, lng: 14.2681 },
  
  // Spain
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 }, // Capital
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
  
  // Netherlands
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 }, // Capital
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
  { name: 'Hague', lat: 52.0705, lng: 4.3007 },
  
  // Belgium
  { name: 'Brussels', lat: 50.8503, lng: 4.3517 }, // Capital
  { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
  { name: 'Ghent', lat: 51.0543, lng: 3.7174 },
  
  // Portugal
  { name: 'Lisbon', lat: 38.7223, lng: -9.1393 }, // Capital
  { name: 'Porto', lat: 41.1579, lng: -8.6291 },
  { name: 'Braga', lat: 41.5518, lng: -8.4229 },
  
  // Greece
  { name: 'Athens', lat: 37.9838, lng: 23.7275 }, // Capital
  { name: 'Thessaloniki', lat: 40.6401, lng: 22.9444 },
  { name: 'Patras', lat: 38.2466, lng: 21.7346 },
  
  // Poland
  { name: 'Warsaw', lat: 52.2297, lng: 21.0122 }, // Capital
  { name: 'Krakow', lat: 50.0647, lng: 19.9450 },
  { name: 'Lodz', lat: 51.7592, lng: 19.4560 },
  
  // Czech Republic
  { name: 'Prague', lat: 50.0755, lng: 14.4378 }, // Capital
  { name: 'Brno', lat: 49.1951, lng: 16.6068 },
  { name: 'Ostrava', lat: 49.8209, lng: 18.2625 },
  
  // Romania
  { name: 'Bucharest', lat: 44.4268, lng: 26.1025 }, // Capital
  { name: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 },
  { name: 'Constanta', lat: 44.1598, lng: 28.6348 },
  
  // Hungary
  { name: 'Budapest', lat: 47.4979, lng: 19.0402 }, // Capital
  { name: 'Szeged', lat: 46.2530, lng: 20.1414 },
  { name: 'Debrecen', lat: 47.5316, lng: 21.6273 },
  
  // Austria
  { name: 'Vienna', lat: 48.2082, lng: 16.3738 }, // Capital
  { name: 'Graz', lat: 47.0707, lng: 15.4395 },
  { name: 'Linz', lat: 48.3069, lng: 14.2858 },
  
  // Switzerland
  { name: 'Bern', lat: 46.9481, lng: 7.4474 }, // Capital
  { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { name: 'Geneva', lat: 46.2044, lng: 6.1432 },
  
  // Sweden
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686 }, // Capital
  { name: 'Gothenburg', lat: 57.7089, lng: 11.9746 },
  { name: 'Malmo', lat: 55.6059, lng: 13.0007 },
  
  // Norway
  { name: 'Oslo', lat: 59.9139, lng: 10.7522 }, // Capital
  { name: 'Bergen', lat: 60.3913, lng: 5.3221 },
  { name: 'Trondheim', lat: 63.4305, lng: 10.3951 },
  
  // Denmark
  { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 }, // Capital
  { name: 'Aarhus', lat: 56.1629, lng: 10.2039 },
  { name: 'Aalborg', lat: 57.0488, lng: 9.9217 },
  
  // Finland
  { name: 'Helsinki', lat: 60.1699, lng: 24.9384 }, // Capital
  { name: 'Tampere', lat: 61.4981, lng: 23.7610 },
  { name: 'Turku', lat: 60.4518, lng: 22.2666 },
  
  // Ireland
  { name: 'Dublin', lat: 53.3498, lng: -6.2603 }, // Capital
  { name: 'Cork', lat: 51.8985, lng: -8.4756 },
  { name: 'Limerick', lat: 52.6638, lng: -8.6268 },
  
  // Bulgaria
  { name: 'Sofia', lat: 42.6977, lng: 23.3219 }, // Capital
  { name: 'Plovdiv', lat: 42.1354, lng: 24.7453 },
  { name: 'Varna', lat: 43.2141, lng: 27.9147 },
  
  // Croatia
  { name: 'Zagreb', lat: 45.8150, lng: 15.9819 }, // Capital
  { name: 'Split', lat: 43.5081, lng: 16.4402 },
  { name: 'Rijeka', lat: 45.3271, lng: 14.4422 },
  
  // Slovenia
  { name: 'Ljubljana', lat: 46.0569, lng: 14.5058 }, // Capital
  { name: 'Maribor', lat: 46.5547, lng: 15.6459 },
  { name: 'Celje', lat: 46.2389, lng: 15.2606 },
  
  // Slovakia
  { name: 'Bratislava', lat: 48.1486, lng: 17.1077 }, // Capital
  { name: 'Kosice', lat: 48.7139, lng: 21.2581 },
  { name: 'Presov', lat: 49.0016, lng: 21.2393 },
  
  // Lithuania
  { name: 'Vilnius', lat: 54.6872, lng: 25.2797 }, // Capital
  { name: 'Kaunas', lat: 54.8985, lng: 23.9036 },
  { name: 'Klaipeda', lat: 55.7033, lng: 21.1443 },
  
  // Latvia
  { name: 'Riga', lat: 56.9496, lng: 24.1052 }, // Capital
  { name: 'Daugavpils', lat: 55.8753, lng: 26.5358 },
  { name: 'Liepaja', lat: 56.5047, lng: 21.0108 },
  
  // Estonia
  { name: 'Tallinn', lat: 59.4370, lng: 24.7536 }, // Capital
  { name: 'Tartu', lat: 58.3780, lng: 26.7290 },
  { name: 'Narva', lat: 59.3753, lng: 28.1900 },
  
  // Iceland
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426 }, // Capital
  { name: 'Akureyri', lat: 65.6836, lng: -18.0878 },
  { name: 'Kopavogur', lat: 64.1124, lng: -21.9126 },
  
  // Cyprus
  { name: 'Nicosia', lat: 35.1856, lng: 33.3823 }, // Capital
  { name: 'Limassol', lat: 34.6841, lng: 33.0379 },
  { name: 'Larnaca', lat: 34.9167, lng: 33.6167 },
  
  // Luxembourg
  { name: 'Luxembourg', lat: 49.6116, lng: 6.1319 }, // Capital (city-state)
  
  // Malta
  { name: 'Valletta', lat: 35.8989, lng: 14.5146 }, // Capital
  { name: 'Birkirkara', lat: 35.8972, lng: 14.4614 },
  { name: 'Mosta', lat: 35.9097, lng: 14.4256 },
  
  // Bosnia and Herzegovina
  { name: 'Sarajevo', lat: 43.8563, lng: 18.4131 }, // Capital
  { name: 'Banja Luka', lat: 44.7722, lng: 17.1910 },
  { name: 'Tuzla', lat: 44.5384, lng: 18.6676 },
  
  // Serbia
  { name: 'Belgrade', lat: 44.7866, lng: 20.4489 }, // Capital
  { name: 'Novi Sad', lat: 45.2671, lng: 19.8335 },
  { name: 'Nis', lat: 43.3209, lng: 21.8958 },
  
  // Ukraine
  { name: 'Kiev', lat: 50.4501, lng: 30.5234 }, // Capital
  { name: 'Kharkiv', lat: 49.9935, lng: 36.2304 },
  { name: 'Odessa', lat: 46.4825, lng: 30.7233 },
  
  // Belarus
  { name: 'Minsk', lat: 53.9045, lng: 27.5615 }, // Capital
  { name: 'Gomel', lat: 52.4412, lng: 30.9878 },
  { name: 'Mogilev', lat: 53.9167, lng: 30.3500 },
]

// Export city names array for autocomplete
export const europeanCities = europeanCitiesData.map(city => city.name)

