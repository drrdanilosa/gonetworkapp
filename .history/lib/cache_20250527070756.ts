import React from 'react'

/**
 * Sistema de cache em memória para otimizar performance
 * Inclui TTL (Time To Live) e LRU (Least Recently Used) eviction
 */

interface CacheItem<T> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
}

class MemoryCache<T = unknown> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl?: number): void {
    // Remove expired items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictExpired()
      
      // If still full, remove least recently used
      if (this.cache.size >= this.maxSize) {
        this.evictLRU()
      }
    }

    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
    }

    this.cache.set(key, item)
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access count for LRU
    item.accessCount++
    
    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private evictExpired(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null
    let minAccessCount = Infinity
    
    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount
        lruKey = key
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Instâncias de cache para diferentes tipos de dados
export const apiCache = new MemoryCache(50, 2 * 60 * 1000) // 2 minutos para API
export const userCache = new MemoryCache(20, 10 * 60 * 1000) // 10 minutos para dados de usuário
export const projectCache = new MemoryCache(30, 5 * 60 * 1000) // 5 minutos para projetos

// Hook para cache com React
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; cache?: MemoryCache }
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  const cache = options?.cache || apiCache
  
  React.useEffect(() => {
    // Check cache first
    const cached = cache.get(key)
    if (cached) {
      setData(cached)
      return
    }
    
    // Fetch data
    setLoading(true)
    setError(null)
    
    fetcher()
      .then((result) => {
        cache.set(key, result, options?.ttl)
        setData(result)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key])
  
  const refresh = React.useCallback(() => {
    cache.delete(key)
    setLoading(true)
    setError(null)
    
    fetcher()
      .then((result) => {
        cache.set(key, result, options?.ttl)
        setData(result)
      })
      .catch((err) => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key, fetcher, options?.ttl])
  
  return { data, loading, error, refresh }
}

// Utilitários para cache de funções
export function memoizeWithCache<T extends (...args: unknown[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  cache: MemoryCache = apiCache,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    const cached = cache.get(key)
    
    if (cached !== null) {
      return cached
    }
    
    const result = fn(...args)
    cache.set(key, result, ttl)
    
    return result
  }) as T
}

// Cache para requests HTTP
export async function cachedFetch(
  url: string, 
  options?: RequestInit, 
  ttl?: number
): Promise<Response> {
  const key = `fetch:${url}:${JSON.stringify(options)}`
  const cached = apiCache.get(key)
  
  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  const response = await fetch(url, options)
  
  if (response.ok) {
    const data = await response.clone().json()
    apiCache.set(key, data, ttl)
  }
  
  return response
}
