import type { CountMarker, PluralForms } from '../types';

/**
 * Define a pluralized message. The resolved message is a function of `n` that
 * selects a plural form via `Intl.PluralRules` for the active locale and
 * substitutes `{count}` with `n`.
 *
 * ```ts
 * count({ one: '{count} item', other: '{count} items' })
 * ```
 */
export function count(forms: PluralForms): CountMarker {
  return { _type: 'count', forms };
}
