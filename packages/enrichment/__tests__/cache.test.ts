import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryCacheProvider } from '../src/cache.js';

describe('InMemoryCacheProvider', () => {
  let cache: InMemoryCacheProvider;

  beforeEach(() => {
    cache = new InMemoryCacheProvider(60); // 60 second TTL
  });

  it('returns null for cache miss', async () => {
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('stores and retrieves values', async () => {
    await cache.set('key1', { name: 'test' });
    const result = await cache.get<{ name: string }>('key1');
    expect(result).toEqual({ name: 'test' });
  });

  it('returns null for expired entries', async () => {
    vi.useFakeTimers();
    await cache.set('key1', { name: 'test' });

    // Advance past TTL
    vi.advanceTimersByTime(61_000);

    const result = await cache.get('key1');
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it('returns value before TTL expires', async () => {
    vi.useFakeTimers();
    await cache.set('key1', { name: 'test' });

    // Advance less than TTL
    vi.advanceTimersByTime(30_000);

    const result = await cache.get<{ name: string }>('key1');
    expect(result).toEqual({ name: 'test' });
    vi.useRealTimers();
  });

  it('deletes specific keys', async () => {
    await cache.set('key1', 'a');
    await cache.set('key2', 'b');

    await cache.delete('key1');

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBe('b');
  });

  it('clears all entries', async () => {
    await cache.set('key1', 'a');
    await cache.set('key2', 'b');

    await cache.clear();

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });

  it('supports custom TTL per entry', async () => {
    vi.useFakeTimers();
    await cache.set('short', 'data', 5_000); // 5s TTL
    await cache.set('long', 'data', 120_000); // 120s TTL

    vi.advanceTimersByTime(10_000);

    expect(await cache.get('short')).toBeNull();
    expect(await cache.get('long')).toBe('data');
    vi.useRealTimers();
  });
});
