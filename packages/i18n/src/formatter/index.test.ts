import { describe, expect, it, vi } from 'vitest';

import { atom } from '../atom';
import { formatter } from './index';

describe('formatter', () => {
  it('formats numbers for the active locale and reacts to changes', () => {
    const $locale = atom('en-US');
    const $fmt = formatter($locale);
    expect($fmt.get().number(1000)).toBe('1,000');
    $locale.set('de-DE');
    expect($fmt.get().number(1000)).toBe('1.000');
  });

  it('formats relative time', () => {
    expect(formatter(atom('en')).get().relativeTime(-1, 'day')).toBe('yesterday');
  });

  it('formats a timestamp', () => {
    const out = formatter(atom('en-US'))
      .get()
      .time(0, { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
    expect(out).toBe('01/01/1970');
  });

  describe('currency', () => {
    it('formats USD in en-US', () => {
      expect(formatter(atom('en-US')).get().currency(1000, 'USD')).toBe('$10.00');
    });

    it('formats USD in fr-FR', () => {
      // fr-FR uses non-breaking space as thousands separator and narrow no-break space before symbol
      expect(formatter(atom('fr-FR')).get().currency(100000, 'USD')).toBe('1 000,00 $US');
    });

    it('formats JPY in ja-JP (0 decimal digits)', () => {
      expect(formatter(atom('ja-JP')).get().currency(10000, 'JPY')).toBe('￥10,000');
    });

    it('strips trailing zeros when style is short', () => {
      expect(formatter(atom('en-US')).get().currency(1000, 'USD', { style: 'short' })).toBe('$10');
    });

    it('keeps decimals when non-zero in short style', () => {
      expect(formatter(atom('en-US')).get().currency(1099, 'USD', { style: 'short' })).toBe('$10.99');
    });

    it('treats empty currency code as USD', () => {
      expect(formatter(atom('en-US')).get().currency(0, '')).toBe('$0.00');
    });

    it('reacts to locale changes', () => {
      const $locale = atom('en-US');
      const $fmt = formatter($locale);
      expect($fmt.get().currency(1000, 'USD')).toBe('$10.00');
      $locale.set('de-DE');
      expect($fmt.get().currency(1000, 'USD')).toBe('10,00 $');
    });

    it('falls back when Intl.NumberFormat throws', () => {
      const spy = vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Intl unavailable');
      });
      try {
        // unique locale to avoid hitting cache from other tests
        expect(formatter(atom('en-XB')).get().currency(1000, 'USD')).toBe('USD 10.00');
      } finally {
        spy.mockRestore();
      }
    });
  });
});
