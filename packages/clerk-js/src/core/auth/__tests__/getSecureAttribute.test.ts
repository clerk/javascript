import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecureAttribute } from '../getSecureAttribute';

describe('getSecureAttribute', () => {
  let windowSpy: any;

  beforeEach(() => {
    windowSpy = vi.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('returns true if the protocol is https', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('https://www.clerk.com'),
      safari: undefined,
      isSecureContext: undefined,
    }));
    expect(getSecureAttribute('None')).toBe(true);
  });

  it('returns false if the protocol is not https and the SameSite is not None', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://www.clerk.com'),
      safari: undefined,
      isSecureContext: undefined,
    }));
    expect(getSecureAttribute('Lax')).toBe(false);
  });

  it('returns false if the protocol is not https and the browser is Safari', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://www.clerk.com'),
      safari: { dummyValue: true },
      isSecureContext: undefined,
    }));
    expect(getSecureAttribute('None')).toBe(false);
  });

  it('returns true if isSecureContext is true', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://www.clerk.com'),
      safari: undefined,
      isSecureContext: true,
    }));
    expect(getSecureAttribute('None')).toBe(true);
  });

  it('returns false if isSecureContext is false', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://www.clerk.com'),
      safari: undefined,
      isSecureContext: false,
    }));
    expect(getSecureAttribute('None')).toBe(false);
  });

  it('returns true if the protocol is http and the hostname is localhost and sameSite is None', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://localhost'),
      safari: undefined,
      isSecureContext: undefined,
    }));
    expect(getSecureAttribute('None')).toBe(true);
  });

  it('returns false if the protocol is http and the hostname is localhost and sameSite is not None', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://localhost'),
      safari: undefined,
      isSecureContext: undefined,
    }));
    expect(getSecureAttribute('Lax')).toBe(false);
  });

  it('returns false if the protocol is http and the hostname is not localhost', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://www.clerk.com'),
      safari: undefined,
      isSecureContext: undefined,
    }));
    expect(getSecureAttribute('None')).toBe(false);
  });

  it('returns false in case window.safari is undefined and isSecureContext is true on localhost for Lax cookie', () => {
    windowSpy.mockImplementation(() => ({
      location: new URL('http://localhost'),
      safari: undefined,
      isSecureContext: true,
    }));
    expect(getSecureAttribute('Lax')).toBe(false);
  });
});
