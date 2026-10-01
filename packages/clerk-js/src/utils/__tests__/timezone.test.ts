import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBrowserTimezone } from '../timezone';

describe('getBrowserTimezone()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the browser timezone when available', () => {
    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: 'America/New_York' }) }),
    });

    expect(getBrowserTimezone()).toBe('America/New_York');
  });

  it('returns null when the browser timezone is empty', () => {
    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: '' }) }),
    });

    expect(getBrowserTimezone()).toBeNull();
  });

  it('returns null when Intl is unavailable', () => {
    vi.stubGlobal('Intl', undefined);

    expect(getBrowserTimezone()).toBeNull();
  });

  it('returns null when Intl.DateTimeFormat is unavailable', () => {
    vi.stubGlobal('Intl', {});

    expect(getBrowserTimezone()).toBeNull();
  });

  it('returns null when resolvedOptions throws', () => {
    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({
        resolvedOptions: () => {
          throw new Error('timezone unavailable');
        },
      }),
    });

    expect(getBrowserTimezone()).toBeNull();
  });
});
