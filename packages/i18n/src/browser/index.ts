import { atom } from 'nanostores';

import type { ReadableStore } from '../types';

export interface BrowserOptions {
  /** Locales the app actually ships translations for. */
  available: string[];
  /** Locale to use when none of the browser languages match. Defaults to `'en'`. */
  fallback?: string;
}

/**
 * Resolve a locale from the browser's language preferences, narrowed to the
 * set of `available` locales. Each preference is tried both as-is (`en-US`)
 * and as its base language (`en`). Resolved once, at call time.
 */
export function browser({ available, fallback = 'en' }: BrowserOptions): ReadableStore<string> {
  const langs = typeof navigator !== 'undefined' ? [...(navigator.languages || [navigator.language])] : [fallback];

  const resolved = langs.flatMap(l => [l, l.split('-')[0]]).find(l => available.includes(l)) ?? fallback;

  return atom(resolved);
}
