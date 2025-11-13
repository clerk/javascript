import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { isHttpOrHttps, isProxyUrlRelative, isValidProxyUrl, proxyUrlToAbsoluteURL } from '../proxy';

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
  it('returns empty string if parameter is undefined', () => {
    expect(proxyUrlToAbsoluteURL(undefined)).toBe('');
  });
});
