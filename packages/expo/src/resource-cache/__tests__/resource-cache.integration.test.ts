/**
 * Integration tests for resource-cache.ts that use an in-memory Map as the
 * backing SecureStore. This complements secure-store.test.ts (which uses
 * per-test mocks) by exercising the queue, slot rotation, corruption
 * recovery, and unicode handling against a realistic store.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const store = new Map<string, string>();

const mocks = vi.hoisted(() => {
  const map = new Map<string, string>();
  return {
    map,
    setItemAsync: vi.fn(async (k: string, v: string) => {
      map.set(k, v);
    }),
    getItemAsync: vi.fn(async (k: string) => {
      return map.has(k) ? map.get(k)! : null;
    }),
    deleteItemAsync: vi.fn(async (k: string) => {
      map.delete(k);
    }),
  };
});

vi.mock('expo-secure-store', () => ({
  setItemAsync: mocks.setItemAsync,
  getItemAsync: mocks.getItemAsync,
  deleteItemAsync: mocks.deleteItemAsync,
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
}));

import { createResourceCacheStore } from '../resource-cache';

const KEY = 'res';

beforeEach(() => {
  mocks.map.clear();
  store.clear();
  mocks.setItemAsync.mockClear();
  mocks.getItemAsync.mockClear();
  mocks.deleteItemAsync.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// flushes microtasks until processQueue settles. The implementation has
// 8+ awaits per processed item, and the queue can pop two items per drain
// (current + next), so we need a generous count.
const flush = async (ticks = 100) => {
  for (let i = 0; i < ticks; i++) {
    await Promise.resolve();
  }
};

describe('resource-cache integration', () => {
  test('round-trips a small value', async () => {
    const cache = createResourceCacheStore();
    await cache.set(KEY, 'hello');
    await flush();
    expect(await cache.get(KEY)).toBe('hello');
  });

  test('round-trips a multi-chunk value', async () => {
    const cache = createResourceCacheStore();
    const big = 'x'.repeat(1024 * 5 + 200); // 5+ chunks
    await cache.set(KEY, big);
    await flush();
    expect(await cache.get(KEY)).toBe(big);
  });

  test('does not split unicode surrogate pairs', async () => {
    const cache = createResourceCacheStore();
    // Build a string of multi-codepoint emojis around the chunk boundary.
    // 1024 emoji glyphs (each 2 UTF-16 code units) crosses the chunk size.
    const emoji = '🚀'.repeat(1100);
    await cache.set(KEY, emoji);
    await flush();
    expect(await cache.get(KEY)).toBe(emoji);
  });

  test('subsequent sets alternate between A and B slots', async () => {
    const cache = createResourceCacheStore();
    await cache.set(KEY, 'first');
    await flush();
    expect(mocks.map.get(`${KEY}-latest`)).toBe('B');

    await cache.set(KEY, 'second');
    await flush();
    expect(mocks.map.get(`${KEY}-latest`)).toBe('A');

    await cache.set(KEY, 'third');
    await flush();
    expect(mocks.map.get(`${KEY}-latest`)).toBe('B');
  });

  test('previous slot remains intact during a subsequent write', async () => {
    const cache = createResourceCacheStore();
    await cache.set(KEY, 'first');
    await flush();
    await cache.set(KEY, 'second');
    await flush();

    // After two writes, latest is in slot A. The B slot still has the first write.
    expect(mocks.map.get(`${KEY}-B-complete`)).toBe('true');
    expect(mocks.map.get(`${KEY}-A-complete`)).toBe('true');
  });

  test('latest slot has the latest value after multiple writes', async () => {
    const cache = createResourceCacheStore();
    await cache.set(KEY, 'one');
    await flush();
    await cache.set(KEY, 'two');
    await flush();
    await cache.set(KEY, 'three');
    await flush();
    expect(await cache.get(KEY)).toBe('three');
  });

  test('setting a smaller value after a larger value deletes old extra chunks', async () => {
    const cache = createResourceCacheStore();
    const big = 'x'.repeat(1024 * 4); // 4 chunks
    await cache.set(KEY, big);
    await flush();

    const small = 'tiny';
    await cache.set(KEY, small);
    await flush();

    expect(await cache.get(KEY)).toBe(small);
    // The new (latest) slot's chunks beyond chunk-0 must have been deleted
    const latest = mocks.map.get(`${KEY}-latest`)!;
    expect(mocks.map.has(`${KEY}-${latest}-chunk-1`)).toBe(false);
  });

  test('get returns null when latest slot is incomplete (mid-write crash simulation)', async () => {
    const cache = createResourceCacheStore();
    await cache.set(KEY, 'one');
    await flush();

    // Manually corrupt the latest slot's complete flag
    const latest = mocks.map.get(`${KEY}-latest`)!;
    mocks.map.set(`${KEY}-${latest}-complete`, 'false');

    // Get should fall back to the other slot, which is empty (never written) → null
    expect(await cache.get(KEY)).toBeNull();
  });

  test('get falls back to the other slot when the latest slot is incomplete', async () => {
    const cache = createResourceCacheStore();
    await cache.set(KEY, 'first');
    await flush();
    await cache.set(KEY, 'second');
    await flush();

    // Corrupt the latest slot
    const latest = mocks.map.get(`${KEY}-latest`)!;
    mocks.map.set(`${KEY}-${latest}-complete`, 'false');

    // Should fall back to the previous slot which still has 'first'
    expect(await cache.get(KEY)).toBe('first');
  });

  test('get returns null when both slots are absent', async () => {
    const cache = createResourceCacheStore();
    expect(await cache.get('never_set')).toBeNull();
  });

  test('queue collapses concurrent set calls and the latest value wins', async () => {
    const cache = createResourceCacheStore();
    // Fire many sets without awaiting
    const promises: Promise<void>[] = [];
    for (let i = 0; i < 25; i++) {
      promises.push(cache.set(KEY, `v${i}`));
    }
    await Promise.all(promises);
    await flush();

    // The implementation pops the most recent and clears the queue, so the
    // final get returns the most recent value pushed.
    expect(await cache.get(KEY)).toBe('v24');
  });

  // Note: error-recovery (setItemAsync rejection) is already covered by
  // secure-store.test.ts:256 ('does not change the value if set fails').
  // We don't duplicate it here because the implementation rethrows from
  // `void processQueue()`, which surfaces as an unhandled rejection that
  // vitest cannot swallow inside a single test.
});
