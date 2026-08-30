import { computed } from 'nanostores';

import type { ReadableStore } from '../types';

/**
 * Combine several locale stores into one, preferring the first that holds a
 * non-nullish value. Falls back to `'en'` when every source is empty.
 */
export function localeFrom(...stores: ReadableStore<string | null | undefined>[]): ReadableStore<string> {
  return computed(stores, (...values) => values.find(value => value != null) ?? 'en');
}
