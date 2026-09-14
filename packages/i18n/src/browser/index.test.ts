import { afterEach, describe, expect, it, vi } from 'vitest';

import { browser } from './index';

describe('browser', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('resolves an exact match from navigator.languages', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR', 'en'] });
    expect(browser({ available: ['en', 'fr-FR'] }).get()).toBe('fr-FR');
  });

  it('falls back to the base language of a regional preference', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR'] });
    expect(browser({ available: ['en', 'fr'] }).get()).toBe('fr');
  });

  it('uses the fallback when nothing is available', () => {
    vi.stubGlobal('navigator', { languages: ['de'] });
    expect(browser({ available: ['en', 'fr'], fallback: 'en' }).get()).toBe('en');
  });

  it('defaults the fallback to en', () => {
    vi.stubGlobal('navigator', { languages: ['de'] });
    expect(browser({ available: ['fr'] }).get()).toBe('en');
  });
});
