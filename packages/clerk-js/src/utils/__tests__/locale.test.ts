import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBrowserLocale } from '../locale';

describe('getBrowserLocale()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the browser locale when available', () => {
    vi.stubGlobal('navigator', { language: 'es-ES' });

    expect(getBrowserLocale()).toBe('es-ES');
  });

  it('returns null as default when navigator.language is not available', () => {
    vi.stubGlobal('navigator', { language: undefined });

    expect(getBrowserLocale()).toBeNull();
  });

  it('returns null as default when navigator.language is empty string', () => {
    vi.stubGlobal('navigator', { language: '' });

    expect(getBrowserLocale()).toBeNull();
  });

  it('returns null as default when navigator object is not defined', () => {
    vi.stubGlobal('navigator', undefined);

    expect(getBrowserLocale()).toBeNull();
  });
});
