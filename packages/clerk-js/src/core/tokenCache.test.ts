import { TokenResource } from '@clerk/types';
import jwtGen from 'jsonwebtoken';

import { Token } from './resources/Token';
import { MemoryTokenCache } from './tokenCache';

// This is required since abstract TS methods are undefined in Jest
jest.mock('./resources/Base', () => {
  class BaseResource {}

  return {
    BaseResource,
  };
});

jest.useFakeTimers();

const jwt = jwtGen.sign(
  {
    exp: Math.floor(Date.now() / 1000) + 60,
    data: 'foobar',
  },
  'secret',
);

describe('MemoryTokenCache', () => {
  it('caches tokenResolver while is pending until the JWT expiration', async () => {
    const cache = MemoryTokenCache();
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

    // Clear the cache
    cache.clear();

    // Cache is empty, tokenResolver has been removed due to cache clearance
    expect(cache.get(key)).toBeUndefined();
  });
});
