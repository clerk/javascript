import { isProxyUrlRelative, isValidProxyUrl, proxyUrlToAbsoluteURL } from './proxy';

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

describe('proxyUrlToAbsoluteURL(url)', () => {
  global.window = Object.create(window);
  // @ts-ignore
  global.window.location = {
    origin: 'https://clerk.dev',
  };
  it('returns an absolute URL made from window.location.origin and the partial a path', () => {
    expect(proxyUrlToAbsoluteURL('/api/__clerk')).toBe('https://clerk.dev/api/__clerk');
  });

  it('returns the same value as the parameter given as it already an absolute URL', () => {
    expect(proxyUrlToAbsoluteURL('https://clerk.dev/api/__clerk')).toBe('https://clerk.dev/api/__clerk');
  });
  it('returns empty string if parameter is undefined', () => {
    expect(proxyUrlToAbsoluteURL(undefined)).toBe('');
  });
});
