import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getAutoProxyUrlFromEnvironment,
  isHttpOrHttps,
  isProxyUrlRelative,
  isValidProxyUrl,
  proxyUrlToAbsoluteURL,
  shouldAutoProxy,
} from '../proxy';

describe('isValidProxyUrl(key)', () => {
  it('returns true if the proxyUrl is valid', () => {
    expect(isValidProxyUrl('https://proxy-app.dev/api/__clerk')).toBe(true);
  });

  it('returns true if the proxyUrl is valid', () => {
    expect(isValidProxyUrl('/api/__clerk')).toBe(true);
  });

  it('returns false if the proxyUrl is invalid', () => {
    expect(isValidProxyUrl('proxy-app.dev/api/__clerk')).toBe(false);
  });
});

describe('isProxyUrlRelative(key)', () => {
  it('returns true if the proxyUrl starts with `/`', () => {
    expect(isProxyUrlRelative('/api/__clerk')).toBe(true);
  });

  it('returns false if the proxyUrl does not starts with `/`', () => {
    expect(isProxyUrlRelative('proxy-app.dev/api/__clerk==')).toBe(false);
  });
});

describe('isHttpOrHttps(key)', () => {
  it.each([
    ['http://clerk.com/api/__clerk', true],
    ['http://clerk.com/api/__clerk', true],
    [undefined, false],
    ['/api/__clerk', false],
    ['', false],
  ])('.isHttpOrHttps(%s)', (key, expected) => {
    expect(isHttpOrHttps(key)).toBe(expected);
  });
});

describe('shouldAutoProxy(hostname)', () => {
  it('returns true for a .vercel.app subdomain', () => {
    expect(shouldAutoProxy('myapp.vercel.app')).toBe(true);
  });

  it('returns true for a git branch preview subdomain', () => {
    expect(shouldAutoProxy('myapp-git-branch.vercel.app')).toBe(true);
  });

  it('returns false for the bare vercel.app domain', () => {
    expect(shouldAutoProxy('vercel.app')).toBe(false);
  });

  it('returns false for a custom domain', () => {
    expect(shouldAutoProxy('myapp.com')).toBe(false);
  });

  it('returns false for a domain that contains vercel.app but is not a subdomain', () => {
    expect(shouldAutoProxy('vercel.app.evil.com')).toBe(false);
  });
});

describe('getAutoProxyUrlFromEnvironment(options)', () => {
  it('returns a relative proxy path for Vercel production deployments with production keys', () => {
    expect(
      getAutoProxyUrlFromEnvironment({
        publishableKey: 'pk_live_Zm9vLmNsZXJrLmNvbSQ=',
        environment: {
          VERCEL_PROJECT_PRODUCTION_URL: 'myapp.vercel.app',
          VERCEL_TARGET_ENV: 'production',
        },
      }),
    ).toBe('/__clerk');
  });

  it('returns empty string for non-production Clerk keys', () => {
    expect(
      getAutoProxyUrlFromEnvironment({
        publishableKey: 'pk_test_Zm9vLmNsZXJrLmFjY291bnRzLmRldiQ=',
        environment: {
          VERCEL_PROJECT_PRODUCTION_URL: 'myapp.vercel.app',
          VERCEL_TARGET_ENV: 'production',
        },
      }),
    ).toBe('');
  });

  it('returns empty string when an explicit domain or proxyUrl is configured', () => {
    expect(
      getAutoProxyUrlFromEnvironment({
        hasDomain: true,
        publishableKey: 'pk_live_Zm9vLmNsZXJrLmNvbSQ=',
        environment: {
          VERCEL_PROJECT_PRODUCTION_URL: 'myapp.vercel.app',
          VERCEL_TARGET_ENV: 'production',
        },
      }),
    ).toBe('');

    expect(
      getAutoProxyUrlFromEnvironment({
        hasProxyUrl: true,
        publishableKey: 'pk_live_Zm9vLmNsZXJrLmNvbSQ=',
        environment: {
          VERCEL_PROJECT_PRODUCTION_URL: 'myapp.vercel.app',
          VERCEL_TARGET_ENV: 'production',
        },
      }),
    ).toBe('');
  });

  it('returns empty string for ineligible or non-production Vercel environments', () => {
    expect(
      getAutoProxyUrlFromEnvironment({
        publishableKey: 'pk_live_Zm9vLmNsZXJrLmNvbSQ=',
        environment: {
          VERCEL_PROJECT_PRODUCTION_URL: 'myapp.com',
          VERCEL_TARGET_ENV: 'production',
        },
      }),
    ).toBe('');

    expect(
      getAutoProxyUrlFromEnvironment({
        publishableKey: 'pk_live_Zm9vLmNsZXJrLmNvbSQ=',
        environment: {
          VERCEL_PROJECT_PRODUCTION_URL: 'myapp.vercel.app',
          VERCEL_TARGET_ENV: 'preview',
        },
      }),
    ).toBe('');
  });
});

describe('proxyUrlToAbsoluteURL(url)', () => {
  const currentLocation = global.window.location;

  beforeEach(() => {
    Object.defineProperty(global.window, 'location', {
      get() {
        return {
          origin: 'https://clerk.com',
        };
      },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global.window, 'location', {
      value: currentLocation,
      writable: true,
    });
  });

  it('returns an absolute URL made from window.location.origin and the partial a path', () => {
    expect(proxyUrlToAbsoluteURL('/api/__clerk')).toBe('https://clerk.com/api/__clerk');
  });

  it('returns the same value as the parameter given as it already an absolute URL', () => {
    expect(proxyUrlToAbsoluteURL('https://clerk.com/api/__clerk')).toBe('https://clerk.com/api/__clerk');
  });

  it('returns the relative URL unchanged when window is unavailable', () => {
    const currentWindow = global.window;

    Object.defineProperty(global, 'window', {
      value: undefined,
      configurable: true,
    });

    expect(proxyUrlToAbsoluteURL('/api/__clerk')).toBe('/api/__clerk');

    Object.defineProperty(global, 'window', {
      value: currentWindow,
      writable: true,
      configurable: true,
    });
  });

  it('returns empty string if parameter is undefined', () => {
    expect(proxyUrlToAbsoluteURL(undefined)).toBe('');
  });
});
