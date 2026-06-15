import { describe, expect, it } from 'vitest';

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
});
