import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { getCookieDomain as _getCookieDomain } from '../getCookieDomain';

type CookieHandler = NonNullable<Parameters<typeof _getCookieDomain>[1]>;

describe('getCookieDomain', () => {
  let getCookieDomain: typeof _getCookieDomain;
  beforeEach(async () => {
    // We're dynamically importing getCookieDomain here to reset the module-level cache
    vi.resetModules();
    getCookieDomain = await import('../getCookieDomain').then(m => m.getCookieDomain);
  });

  it('returns the eTLD+1 domain based on where the cookie can be set', () => {
    // This unit tests relies on browser APIs that we can't mock without
    // rendering this test useless.
    // This logic will be covered by a separate E2E test suite, however, for
    // we will pretend that the fr.hosting.co.uk is the eTLD of a hosting provider
    // and app.fr.hosting.co.uk is the actual eTLD+1 domain.
    // This test mostly covers the iteration logic and the cookie setting logic, we
    // assume that the Public Suffix List is correctly handled by the browser.
    const hostname = 'app.fr.hosting.co.uk';
    const handler: CookieHandler = {
      get: vi
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce('1'),
      set: vi.fn().mockReturnValue(undefined),
      remove: vi.fn().mockReturnValue(undefined),
    };
    const result = getCookieDomain(hostname, handler);
    expect(result).toBe(hostname);
  });

  it('passes cookie attributes to the probe', () => {
    const hostname = 'app.example.com';
    const handler: CookieHandler = {
      get: vi.fn().mockReturnValueOnce(undefined).mockReturnValueOnce('1'),
      set: vi.fn().mockReturnValue(undefined),
      remove: vi.fn().mockReturnValue(undefined),
    };
    const attrs = { sameSite: 'None', secure: true };
    getCookieDomain(hostname, handler, attrs);
    expect(handler.set).toHaveBeenCalledWith('1', { sameSite: 'None', secure: true, domain: 'example.com' });
    expect(handler.set).toHaveBeenCalledWith('1', { sameSite: 'None', secure: true, domain: 'app.example.com' });
  });

  it('handles localhost', () => {
    const hostname = 'localhost';
    const result = getCookieDomain(hostname);
    expect(result).toBe('localhost');
  });

  it('handles common addresses pointing to localhost', () => {
    const commonAddresses = ['0.0.0.0', '127.0.0.1'];
    for (const commonAddress of commonAddresses) {
      const result = getCookieDomain(commonAddress);
      expect(result).toBe(commonAddress);
    }
  });

  it('handles custom hosts defined locally', () => {
    expect(getCookieDomain('bryce-local')).toBe('bryce-local');
  });

  it('falls back to hostname if the domain could not be determined', () => {
    const handler: CookieHandler = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn().mockReturnValue(undefined),
      remove: vi.fn().mockReturnValue(undefined),
    };
    const hostname = 'app.hello.co.uk';
    const result = getCookieDomain(hostname, handler);
    expect(result).toBe(hostname);
  });

  it('uses cached value if there is one', () => {
    const hostname = 'clerk.com';
    const handler: CookieHandler = {
      get: vi.fn().mockReturnValue('1'),
      set: vi.fn().mockReturnValue(undefined),
      remove: vi.fn().mockReturnValue(undefined),
    };
    expect(getCookieDomain(hostname, handler)).toBe(hostname);
    expect(getCookieDomain(hostname, handler)).toBe(hostname);
    expect(handler.get).toHaveBeenCalledTimes(1);
  });
});
