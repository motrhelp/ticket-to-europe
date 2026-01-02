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
}

