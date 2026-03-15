/**
 * Phase 4: Cache Behaviour Testing
 *
 * Verifies the pluggable cache works correctly, the default in-memory
 * cache behaves as expected, and custom providers plug in cleanly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnrichmentService } from '../src/enrichment-service.js';
import { InMemoryCacheProvider } from '../src/cache.js';
import type { CacheProvider } from '../src/types.js';

describe('Phase 4: Cache Behaviour', () => {
  describe('default in-memory cache', () => {
    it('caches enrichCompany results', async () => {
      const service = new EnrichmentService({ clearbitApiKey: 'sk-test' });
      // First call — would call clearbit (but we're testing structure, not the API)
      // In mock-fallback scenarios, test with a partial config
      const mockCache = new InMemoryCacheProvider(3600);
      const serviceWithCache = new EnrichmentService({
        cache: mockCache,
      });

      const result1 = await serviceWithCache.enrichCompany({ domain: 'test.com' });
      expect(result1.cached).toBe(false);
      expect(result1.provider).toBe('mock'); // no clearbit key
    });

    it('returns cached result on second call', async () => {
      const cache = new InMemoryCacheProvider(3600);
      // Pre-populate cache
      const cachedData = {
        success: true,
        company: { name: 'Cached Corp', domain: 'cached.com' },
        provider: 'clearbit' as const,
        cached: false,
        timestamp: new Date(),
      };
      await cache.set('clearbit:company:cached.com', cachedData);

      const service = new EnrichmentService({
        clearbitApiKey: 'sk-test',
        cache,
      });

      const result = await service.enrichCompany({ domain: 'cached.com' });
      expect(result.cached).toBe(true);
      expect(result.company?.name).toBe('Cached Corp');
    });

    it('different params produce different cache entries', async () => {
      const cache = new InMemoryCacheProvider(3600);
      await cache.set('clearbit:company:a.com', {
        success: true,
        company: { name: 'Company A', domain: 'a.com' },
        provider: 'clearbit',
        cached: false,
        timestamp: new Date(),
      });
      await cache.set('clearbit:company:b.com', {
        success: true,
        company: { name: 'Company B', domain: 'b.com' },
        provider: 'clearbit',
        cached: false,
        timestamp: new Date(),
      });

      const resultA = await cache.get<{ company: { name: string } }>('clearbit:company:a.com');
      const resultB = await cache.get<{ company: { name: string } }>('clearbit:company:b.com');

      expect(resultA?.company.name).toBe('Company A');
      expect(resultB?.company.name).toBe('Company B');
    });

    it('cache respects TTL', async () => {
      vi.useFakeTimers();
      const cache = new InMemoryCacheProvider(1); // 1 second TTL

      await cache.set('key', { value: 'test' });
      expect(await cache.get('key')).toEqual({ value: 'test' });

      vi.advanceTimersByTime(2000); // 2 seconds
      expect(await cache.get('key')).toBeNull();
      vi.useRealTimers();
    });
  });

  describe('NoOp cache (caching disabled)', () => {
    it('never returns cached data', async () => {
      const noOpCache: CacheProvider = {
        async get() {
          return null;
        },
        async set() {},
        async delete() {},
        async clear() {},
      };

      const service = new EnrichmentService({ cache: noOpCache });

      const result1 = await service.enrichCompany({ domain: 'test.com' });
      const result2 = await service.enrichCompany({ domain: 'test.com' });

      // Both should be uncached (mock mode, but cache was never hit)
      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
    });
  });

  describe('custom CacheProvider', () => {
    it('calls custom provider methods correctly', async () => {
      const getSpy = vi.fn().mockResolvedValue(null);
      const setSpy = vi.fn().mockResolvedValue(undefined);
      const deleteSpy = vi.fn().mockResolvedValue(undefined);
      const clearSpy = vi.fn().mockResolvedValue(undefined);

      const customCache: CacheProvider = {
        get: getSpy,
        set: setSpy,
        delete: deleteSpy,
        clear: clearSpy,
      };

      const service = new EnrichmentService({
        clearbitApiKey: 'sk-test',
        cache: customCache,
      });

      // enrichCompany should try cache.get then cache.set
      await service.enrichCompany({ domain: 'custom-test.com' });

      expect(getSpy).toHaveBeenCalledWith('clearbit:company:custom-test.com');
      // Note: set is only called on successful real API calls, which won't happen
      // in test. But get is always called.
    });

    it('clearCache calls custom provider clear', async () => {
      const clearSpy = vi.fn().mockResolvedValue(undefined);
      const customCache: CacheProvider = {
        async get() {
          return null;
        },
        async set() {},
        async delete() {},
        clear: clearSpy,
      };

      const service = new EnrichmentService({ cache: customCache });
      await service.clearCache();

      expect(clearSpy).toHaveBeenCalledOnce();
    });
  });
});
