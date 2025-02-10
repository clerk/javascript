import type { TokenResource } from '@clerk/types';

import { Token } from '../resources/internal';
import { SessionTokenCache } from '../tokenCache';

// This is required since abstract TS methods are undefined in Jest
jest.mock('../resources/Base', () => {
  class BaseResource {}

  return {
    BaseResource,
  };
});

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzB9.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg';

describe('MemoryTokenCache', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
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
    jest.advanceTimersByTime(100);
    await tokenResolver;

    // Cache is not empty, retrieve the resolved tokenResolver
    expect(isResolved).toBe(true);
    expect(cache.get(key)).toEqual({
      ...key,
      tokenResolver,
    });

    // Advance the timer to force the JWT expiration
    jest.advanceTimersByTime(60 * 1000);

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
      jest.advanceTimersByTime(45 * 1000);
      expect(cache.get(key)).toMatchObject(key);

      // 46s since token created
      jest.advanceTimersByTime(1 * 1000);
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
      jest.advanceTimersByTime(45 * 1000);
      expect(cache.get(key, 0)).toMatchObject(key);

      // 54s since token created
      jest.advanceTimersByTime(9 * 1000);
      expect(cache.get(key, 0)).toMatchObject(key);

      // 55s since token created
      jest.advanceTimersByTime(1 * 1000);
      expect(cache.get(key, 0)).toBeUndefined();
    });
  });
});
