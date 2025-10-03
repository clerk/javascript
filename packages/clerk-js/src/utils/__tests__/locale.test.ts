import { describe, expect, it } from 'vitest';

import { getBrowserLocale } from '../locale';

describe('getBrowserLocale()', () => {
  it('returns the browser locale when available', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'es-ES',
      configurable: true,
    });

    expect(getBrowserLocale()).toBe('es-ES');
  });

  it('returns en-US as default when navigator.language is not available', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: undefined,
      configurable: true,
    });

    expect(getBrowserLocale()).toBe('en-US');
  });

  it('returns en-US when navigator.language is empty string', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: '',
      configurable: true,
    });

    expect(getBrowserLocale()).toBe('en-US');
  });

  it('returns en-US when navigator object is not defined', () => {
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      configurable: true,
    });

    expect(getBrowserLocale()).toBe('en-US');
  });
});
