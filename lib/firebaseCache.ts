'use client';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_PREFIX = 'glp_';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class FirebaseCache {
  // Get item from cache
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;
      
      const cached: CacheItem<T> = JSON.parse(item);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cached.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  // Set item in cache
  static set<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  // Clear specific cache key
  static clear(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_PREFIX + key);
  }
  
  // Clear all cache
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  // Check if cache is valid
  static isValid(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Export clear all function for external use
export const clearAllCache = () => FirebaseCache.clearAll();

// Cache keys
export const CACHE_KEYS = {
  USERS: 'users',
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
  TEAM: 'team',
  HERO: 'hero',
  SUBMISSIONS: 'submissions',
  STATS: 'stats',
} as const;
