import type { LocalizationResource } from '@clerk/shared/types';

import { enUS } from './en-US';

const pseudoCharacterMap = {
  a: 'å',
  b: 'ƀ',
  c: 'ç',
  d: 'ð',
  e: 'é',
  f: 'ƒ',
  g: 'ğ',
  h: 'ħ',
  i: 'ï',
  j: 'ĵ',
  k: 'ķ',
  l: 'ľ',
  m: 'ɱ',
  n: 'ñ',
  o: 'ø',
  p: 'þ',
  q: 'ʠ',
  r: 'ř',
  s: 'š',
  t: 'ŧ',
  u: 'ü',
  v: 'ṽ',
  w: 'ŵ',
  x: 'ẋ',
  y: 'ÿ',
  z: 'ž',
} as const;

const pseudoCharacterMapWithUppercase = Object.fromEntries(
  Object.entries(pseudoCharacterMap).flatMap(([source, target]) => [
    [source, target],
    [source.toUpperCase(), target.toLocaleUpperCase('en-US')],
  ]),
) as Record<string, string>;

const tokenOrLetterPattern = /\{\{[^{}]*\}\}|\{[^{}]*\}|[a-zA-Z]/g;

function pseudoLocalizeString(value: string): string {
  return value.replace(tokenOrLetterPattern, segment => {
    if (segment.startsWith('{')) {
      return segment;
    }

    return pseudoCharacterMapWithUppercase[segment] ?? segment;
  });
}

function pseudoLocalizeValue<T>(value: T): T {
  if (typeof value === 'string') {
    return pseudoLocalizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => pseudoLocalizeValue(item)) as T;
  }

  if (value && typeof value === 'object') {
    const localized: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      localized[key] = pseudoLocalizeValue(nestedValue);
    }

    return localized as T;
  }

  return value;
}

const enXAFromEnUS = pseudoLocalizeValue(enUS);

export const enXA: LocalizationResource = {
  ...enXAFromEnUS,
  locale: 'en-XA',
};
