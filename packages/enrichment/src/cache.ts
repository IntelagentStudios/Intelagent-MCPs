import type { CacheProvider } from './types.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * In-memory cache with TTL support.
 * Implements CacheProvider so it can be swapped for Redis, SQLite, etc.
 */
export class InMemoryCacheProvider implements CacheProvider {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(ttlSeconds: number = 86400) {
    this.defaultTtlMs = ttlSeconds * 1000;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
