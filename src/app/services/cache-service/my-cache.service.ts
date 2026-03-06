import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyCacheService {
  private cache = new Map<string, any>();
  private expirationTimes = new Map<string, number>();
  private lastInvalidationTime = 0;

  constructor() {
  }

  set(key: string, value: any, ttl: number = 30 * 1000): void { // TTL u milisekundama (default 30 sek)
    // Add timestamp to track when item was cached
    const itemWithTimestamp = {
      ...value,
      _cachedAt: Date.now()
    };
    this.cache.set(key, itemWithTimestamp);
    this.expirationTimes.set(key, Date.now() + ttl);
  }

  get<T>(key: string): T | null {
    const expiration = this.expirationTimes.get(key);

    if (expiration && expiration < Date.now()) {
      this.cache.delete(key);
      this.expirationTimes.delete(key);
      return null;
    }

    // Check if cache was invalidated after this item was cached
    const cachedItem = this.cache.get(key);
    if (cachedItem && cachedItem._cachedAt && cachedItem._cachedAt < this.lastInvalidationTime) {
      this.cache.delete(key);
      this.expirationTimes.delete(key);
      return null;
    }

    return cachedItem || null;
  }

  has(key: string): boolean {
    return this.cache.has(key) && (!this.expirationTimes.get(key) || this.expirationTimes.get(key)! > Date.now());
  }

  clear(): void {
    this.cache.clear();
    this.expirationTimes.clear();
  }

  // Clear cache entries that match a pattern
  clearPattern(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.expirationTimes.delete(key);
    });
  }

  // Clear all cities-related cache
  clearCitiesCache(): void {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }

  // Clear all categories-related cache
  clearCategoriesCache(): void {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }

  

  // Clear all languages-related cache
  clearLanguagesCache(): void {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }



  clearGendersCache(): void {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }


  // Clear all users-related cache
  clearUsersCache(): void {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }

  // Clear all review-related cache
  clearReviewsCache(): void {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }


  clearBrandsCache() {
    const keys = Array.from(this.cache.keys()).filter(k => k.startsWith('brands-'));
    keys.forEach(k => this.cache.delete(k));
  }
  clearCarsCache(): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith('cars')) { // all cache keys for Cars start with "cars"
        this.cache.delete(key);
      }
    });
  }

  clearColorsCache() {
    // Set invalidation timestamp to invalidate all existing cache entries
    this.lastInvalidationTime = Date.now();
    // Also clear all cache entries to be extra sure
    this.clear();
  }
  clearCountriesCache(): void {
    // Pretpostavimo da je this.cache tipa Map<string, any>
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith('countries-')) { // all cache keys for Countries start with "countries-"
        this.cache.delete(key);
      }
    });
  }

  clearGenderCache() {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith('genders-')) {
        this.cache.delete(key);
      }
    });
  }


  // Clear cache entries that match a specific service pattern
  clearServiceCache(serviceName: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      // Check if the key contains the service pattern or matches common cache patterns
      if (key.includes(serviceName) ||
          key.includes('-') || // Matches pagination patterns like "-1-5", "-2-5"
          key.match(/^[a-zA-Z]*-\d+-\d+$/) || // Matches "query-page-size" patterns
          key.match(/^\d+-\d+$/) || // Matches "page-size" patterns
          key === '') { // Empty query patterns
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.expirationTimes.delete(key);
    });
  }
}
