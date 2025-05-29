import React from 'react'

/**
 * Sistema de cache simples para melhorar performance
 */

interface CacheItem<T> {
  value: T
  timestamp: number
  ttl: number
}

class SimpleCache<T = unknown> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
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

    return item.value
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Instâncias de cache
export const apiCache = new SimpleCache(2 * 60 * 1000) // 2 minutos
export const userCache = new SimpleCache(10 * 60 * 1000) // 10 minutos

// Hook simples para cache
export function useSimpleCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    // Check cache first
    const cached = apiCache.get(key) as T | null
    if (cached) {
      setData(cached)
      return
    }

    // Fetch data
    setLoading(true)

    fetcher()
      .then(result => {
        apiCache.set(key, result, ttl)
        setData(result)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [key, ttl])

  return { data, loading }
}
