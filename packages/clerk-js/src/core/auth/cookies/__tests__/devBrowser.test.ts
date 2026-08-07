import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDevBrowserCookie } from '../devBrowser';

const { cookieStore, removeCalls, setCalls } = vi.hoisted(() => ({
  cookieStore: new Map<string, string>(),
  removeCalls: [] as Array<{ name: string; attributes?: object }>,
  setCalls: [] as Array<{ name: string; value: string; attributes?: object }>,
}));

vi.mock('@clerk/shared/cookie', () => ({
  createCookieHandler: (name: string) => ({
    get: () => cookieStore.get(name),
    remove: (attributes?: object) => {
      removeCalls.push({ name, attributes });
      cookieStore.delete(name);
    },
    set: (value: string, attributes?: object) => {
      setCalls.push({ name, value, attributes });
      cookieStore.set(name, value);
    },
  }),
}));

describe('createDevBrowserCookie', () => {
  const cookieSuffix = 'test-suffix';
  const suffixedCookieName = '__clerk_db_jwt_test-suffix';
  const unsuffixedCookieName = '__clerk_db_jwt';
  const devBrowser = 'test-dev-browser';
  const now = new Date('2024-01-01T00:00:00.000Z');
  const expires = new Date('2025-01-01T00:00:00.000Z');
  const defaultOptions = { usePartitionedCookies: () => false };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    cookieStore.clear();
    removeCalls.length = 0;
    setCalls.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('removes current, non-partitioned, and partitioned cookie variants for both dev browser cookie names', () => {
    const cookieHandler = createDevBrowserCookie(cookieSuffix, defaultOptions);

    cookieHandler.remove();

    expect(removeCalls).toEqual([
      {
        name: suffixedCookieName,
        attributes: {
          sameSite: 'Lax',
          secure: false,
          partitioned: false,
        },
      },
      { name: suffixedCookieName, attributes: undefined },
      {
        name: suffixedCookieName,
        attributes: {
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      },
      {
        name: unsuffixedCookieName,
        attributes: {
          sameSite: 'Lax',
          secure: false,
          partitioned: false,
        },
      },
      { name: unsuffixedCookieName, attributes: undefined },
      {
        name: unsuffixedCookieName,
        attributes: {
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      },
    ]);
  });

  it('clears stale partitioned cookie variants before writing a new dev browser', () => {
    const cookieHandler = createDevBrowserCookie(cookieSuffix, defaultOptions);

    cookieHandler.set(devBrowser);

    expect(removeCalls).toContainEqual({
      name: suffixedCookieName,
      attributes: {
        sameSite: 'None',
        secure: true,
        partitioned: true,
      },
    });
    expect(removeCalls).toContainEqual({
      name: unsuffixedCookieName,
      attributes: {
        sameSite: 'None',
        secure: true,
        partitioned: true,
      },
    });
    expect(setCalls).toEqual([
      {
        name: suffixedCookieName,
        value: devBrowser,
        attributes: {
          expires,
          sameSite: 'Lax',
          secure: false,
          partitioned: false,
        },
      },
      {
        name: unsuffixedCookieName,
        value: devBrowser,
        attributes: {
          expires,
          sameSite: 'Lax',
          secure: false,
          partitioned: false,
        },
      },
    ]);
  });

  it('reads the suffixed cookie before falling back to the unsuffixed cookie', () => {
    const cookieHandler = createDevBrowserCookie(cookieSuffix, defaultOptions);

    cookieStore.set(unsuffixedCookieName, 'unsuffixed-value');
    cookieStore.set(suffixedCookieName, 'suffixed-value');

    expect(cookieHandler.get()).toBe('suffixed-value');

    cookieStore.delete(suffixedCookieName);

    expect(cookieHandler.get()).toBe('unsuffixed-value');
  });
});
