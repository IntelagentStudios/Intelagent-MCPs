/**
 * Pluggable cache interface for MCP servers.
 *
 * Implement this interface to use Redis, SQLite, DynamoDB, or any custom store.
 * Use {@link InMemoryCacheProvider} as the zero-config default.
 */
export interface CacheProvider {
  /** Retrieve a cached value. Returns `null` on cache miss or expiry. */
  get<T>(key: string): Promise<T | null>;
  /** Store a value with an optional TTL in milliseconds. */
  set<T>(key: string, data: T, ttlMs?: number): Promise<void>;
  /** Remove a specific key from the cache. */
  delete(key: string): Promise<void>;
  /** Remove all entries from the cache. */
  clear(): Promise<void>;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * In-memory cache with TTL support.
 *
 * Suitable for development and single-process deployments.
 * For multi-process or persistent caching, implement {@link CacheProvider}
 * with your preferred backend.
 *
 * @example
 * ```ts
 * const cache = new InMemoryCacheProvider(3600); // 1 hour TTL
 * await cache.set('key', { data: 'value' });
 * const result = await cache.get('key'); // { data: 'value' }
 * ```
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

/**
 * No-op cache that never stores anything.
 * Use this to disable caching entirely.
 *
 * @example
 * ```ts
 * const service = new MyService({ cache: new NoOpCacheProvider() });
 * ```
 */
export class NoOpCacheProvider implements CacheProvider {
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set(): Promise<void> {}
  async delete(): Promise<void> {}
  async clear(): Promise<void> {}
}
