import { describe, expect, it } from 'vitest';

import { atom } from '../atom';
import { direction } from './index';

describe('direction', () => {
  it('reports ltr for latin-script locales', () => {
    expect(direction(atom('en')).get()).toBe('ltr');
    expect(direction(atom('fr-FR')).get()).toBe('ltr');
  });

  it('reports rtl for rtl locales', () => {
    expect(direction(atom('ar')).get()).toBe('rtl');
    expect(direction(atom('he-IL')).get()).toBe('rtl');
    expect(direction(atom('fa')).get()).toBe('rtl');
  });

  it('reacts to locale changes', () => {
    const $locale = atom('en');
    const $dir = direction($locale);
    expect($dir.get()).toBe('ltr');
    $locale.set('ar-EG');
    expect($dir.get()).toBe('rtl');
  });

  it('falls back to ltr for unknown or malformed locales', () => {
    expect(direction(atom('')).get()).toBe('ltr');
    expect(direction(atom('not-a-locale-!!!')).get()).toBe('ltr');
  });
});
