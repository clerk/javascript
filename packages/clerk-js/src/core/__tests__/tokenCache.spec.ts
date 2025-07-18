import type { TokenResource } from '@clerk/types';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { Token } from '../resources/internal';
import { SessionTokenCache } from '../tokenCache';

// This is required since abstract TS methods are undefined in Jest
vi.mock('../resources/Base', () => {
  class BaseResource {}

  return {
    BaseResource,
  };
});

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzB9.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg';

// Helper function to create JWT with custom exp and iat values using the same structure as the working JWT
function createJwtWithTtl(ttlSeconds: number): string {
  // Use the existing JWT as template
  const baseJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzB9.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg';
  const [headerB64, , signature] = baseJwt.split('.');

  // Use the same iat as the original working JWT to maintain consistency with test environment
  // Original JWT: iat: 1675876730, exp: 1675876790 (60 second TTL)
  const baseIat = 1675876730;
  const payload = {
    exp: baseIat + ttlSeconds,
    data: 'foobar', // Keep same data as original
    iat: baseIat,
  };

  // Encode the new payload using base64url encoding (like JWT standard)
  const payloadString = JSON.stringify(payload);
  // Use proper base64url encoding: standard base64 but replace + with -, / with _, and remove padding =
  const newPayloadB64 = btoa(payloadString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `${headerB64}.${newPayloadB64}.${signature}`;
}

describe('MemoryTokenCache', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('clear()', () => {
    it('removes all entries', () => {
      const cache = SessionTokenCache;
      const token = new Token({
        object: 'token',
        id: 'foo',
        jwt,
      });

      const tokenResolver = new Promise<TokenResource>(resolve => setTimeout(() => resolve(token), 100));
      const key = {
        tokenId: 'foo',
        audience: 'bar',
      };

      // Add a tokenResolver to cache
      cache.set({ ...key, tokenResolver });

      expect(cache.get(key)).toBeDefined();
      expect(cache.size()).toEqual(1);

      cache.clear();

      expect(cache.get(key)).toBeUndefined();
      expect(cache.size()).toEqual(0);
    });
  });

  it('caches tokenResolver while is pending until the JWT expiration', async () => {
    const cache = SessionTokenCache;
    const token = new Token({
      object: 'token',
      id: 'foo',
      jwt,
    });

    let isResolved = false;
    const tokenResolver = new Promise<TokenResource>(resolve =>
      setTimeout(() => {
        isResolved = true;
        resolve(token);
      }, 100),
    );

    const key = {
      tokenId: 'foo',
      audience: 'bar',
    };

    // Cache is empty
    expect(cache.get(key)).toBeUndefined();

    // Add a tokenResolver to cache
    cache.set({ ...key, tokenResolver });

    // Cache is not empty, retrieve the unresolved tokenResolver
    expect(cache.get(key)).toEqual({
      ...key,
      tokenResolver,
    });
    expect(isResolved).toBe(false);

    // Wait tokenResolver to resolve
    vi.advanceTimersByTime(100);
    await tokenResolver;

    // Cache is not empty, retrieve the resolved tokenResolver
    expect(isResolved).toBe(true);
    expect(cache.get(key)).toEqual({
      ...key,
      tokenResolver,
    });

    // Advance the timer to force the JWT expiration
    vi.advanceTimersByTime(60 * 1000);

    // Cache is empty, tokenResolver has been removed due to JWT expiration
    expect(cache.get(key)).toBeUndefined();

    // Add another tokenResolver to cache
    cache.set({ ...key, tokenResolver });
  });

  describe('get(key, leeway)', () => {
    it('includes 5 seconds sync leeway', async () => {
      const cache = SessionTokenCache;
      const token = new Token({
        object: 'token',
        id: 'foo',
        jwt,
      });

      const tokenResolver = Promise.resolve(token);
      const key = { tokenId: 'foo', audience: 'bar' };

      cache.set({ ...key, tokenResolver });
      await tokenResolver;

      expect(cache.get(key)).toMatchObject(key);

      // 44s since token created
      vi.advanceTimersByTime(45 * 1000);
      expect(cache.get(key)).toMatchObject(key);

      // 46s since token created
      vi.advanceTimersByTime(1 * 1000);
      expect(cache.get(key)).toBeUndefined();
    });

    it('includes 5 seconds sync leeway even if leeway is removed', async () => {
      const cache = SessionTokenCache;
      const token = new Token({
        object: 'token',
        id: 'foo',
        jwt,
      });

      const tokenResolver = Promise.resolve(token);
      const key = { tokenId: 'foo', audience: 'bar' };

      cache.set({ ...key, tokenResolver });
      await tokenResolver;

      expect(cache.get(key)).toMatchObject(key);

      // 45s since token created
      vi.advanceTimersByTime(45 * 1000);
      expect(cache.get(key, 0)).toMatchObject(key);

      // 54s since token created
      vi.advanceTimersByTime(9 * 1000);
      expect(cache.get(key, 0)).toMatchObject(key);

      // 55s since token created
      vi.advanceTimersByTime(1 * 1000);
      expect(cache.get(key, 0)).toBeUndefined();
    });
  });

  describe('dynamic TTL calculation', () => {
    it('calculates expiresIn from JWT exp and iat claims and sets timeout based on calculated TTL', async () => {
      const cache = SessionTokenCache;

      // Mock Date.now to return a fixed timestamp initially
      const initialTime = 1675876730000; // Same as our JWT's iat in milliseconds
      vi.spyOn(Date, 'now').mockImplementation(() => initialTime);

      // Test with a 30-second TTL
      const shortTtlJwt = createJwtWithTtl(30);
      const shortTtlToken = new Token({
        object: 'token',
        id: 'short-ttl',
        jwt: shortTtlJwt,
      });

      const shortTtlKey = { tokenId: 'short-ttl', audience: 'test' };
      const shortTtlResolver = Promise.resolve(shortTtlToken);
      cache.set({ ...shortTtlKey, tokenResolver: shortTtlResolver });
      await shortTtlResolver;

      const cachedEntry = cache.get(shortTtlKey);
      expect(cachedEntry).toMatchObject(shortTtlKey);

      // Advance both the timer and the mocked current time
      const advanceBy = 31 * 1000;
      vi.advanceTimersByTime(advanceBy);
      vi.spyOn(Date, 'now').mockImplementation(() => initialTime + advanceBy);

      const cachedEntry2 = cache.get(shortTtlKey);
      expect(cachedEntry2).toBeUndefined();
    });

    it('handles tokens with TTL greater than 60 seconds correctly', async () => {
      const cache = SessionTokenCache;

      // Mock Date.now to return a fixed timestamp initially
      const initialTime = 1675876730000; // Same as our JWT's iat in milliseconds
      vi.spyOn(Date, 'now').mockImplementation(() => initialTime);

      // Test with a 120-second TTL
      const longTtlJwt = createJwtWithTtl(120);
      const longTtlToken = new Token({
        object: 'token',
        id: 'long-ttl',
        jwt: longTtlJwt,
      });

      const longTtlKey = { tokenId: 'long-ttl', audience: 'test' };
      const longTtlResolver = Promise.resolve(longTtlToken);
      cache.set({ ...longTtlKey, tokenResolver: longTtlResolver });
      await longTtlResolver;

      // Check token is cached initially
      const cachedEntry = cache.get(longTtlKey);
      expect(cachedEntry).toMatchObject(longTtlKey);

      // Advance 90 seconds - token should still be cached
      const firstAdvance = 90 * 1000;
      vi.advanceTimersByTime(firstAdvance);
      vi.spyOn(Date, 'now').mockImplementation(() => initialTime + firstAdvance);

      const cachedEntryAfter90s = cache.get(longTtlKey);
      expect(cachedEntryAfter90s).toMatchObject(longTtlKey);

      // Advance to 121 seconds - token should be removed
      const secondAdvance = 31 * 1000;
      vi.advanceTimersByTime(secondAdvance);
      vi.spyOn(Date, 'now').mockImplementation(() => initialTime + firstAdvance + secondAdvance);

      const cachedEntryAfter121s = cache.get(longTtlKey);
      expect(cachedEntryAfter121s).toBeUndefined();
    });
  });
});
