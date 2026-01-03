import type { City } from '../data/europeanCities'
import { europeanCitiesData } from '../data/europeanCities'

/**
 * Class to handle selection of the city of the day for players to guess.
 * Currently implements simple random selection.
 */
export class CitySelector {
  private cities: City[]

  constructor(cities: City[] = europeanCitiesData) {
    this.cities = cities
  }

  /**
   * Selects a random city from the available cities.
   * @returns A randomly selected city
   */
  selectRandomCity(): City {
    const randomIndex = Math.floor(Math.random() * this.cities.length)
    return this.cities[randomIndex]
  }

  /**
   * Gets the city of the day.
   * For now, this is simply a random city.
   * @returns The city of the day
   */
  getCityOfTheDay(): City {
    return this.selectRandomCity()
  }

  /**
   * Calculates the distance between two cities using the Haversine formula.
   * @param city1 First city
   * @param city2 Second city
   * @returns Distance in kilometers
   */
  calculateDistance(city1: City, city2: City): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(city2.lat - city1.lat)
    const dLng = this.toRadians(city2.lng - city1.lng)
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(city1.lat)) *
        Math.cos(this.toRadians(city2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Converts degrees to radians.
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Finds the N closest cities to a reference city, excluding specified cities.
   * @param referenceCity The city to find neighbors for
   * @param excludeCities Cities to exclude from results (e.g., already guessed)
   * @param count Number of closest cities to return
   * @returns Array of closest cities, sorted by distance
   */
  findClosestCities(
    referenceCity: City,
    excludeCities: City[] = [],
    count: number = 3
  ): City[] {
    const excludeNames = new Set(excludeCities.map(c => c.name))
    
    // Calculate distances for all cities except the reference and excluded ones
    const citiesWithDistances = this.cities
      .filter(city => city.name !== referenceCity.name && !excludeNames.has(city.name))
      .map(city => ({
        city,
        distance: this.calculateDistance(referenceCity, city),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.city)
    
    return citiesWithDistances
  }
}

