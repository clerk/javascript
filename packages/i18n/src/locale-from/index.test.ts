import { describe, expect, it } from 'vitest';

import { atom } from '../atom';
import { localeFrom } from './index';

describe('localeFrom', () => {
  it('prefers the first store with a non-nullish value', () => {
    const $a = atom<string | null>(null);
    const $b = atom<string | null>('fr');
    expect(localeFrom($a, $b).get()).toBe('fr');
  });

  it('defaults to en when every source is empty', () => {
    expect(localeFrom(atom<string | null>(null)).get()).toBe('en');
  });

  it('updates reactively as sources change', () => {
    const $a = atom<string | null>(null);
    const $combined = localeFrom($a);
    expect($combined.get()).toBe('en');
    $a.set('de');
    expect($combined.get()).toBe('de');
  });
});
