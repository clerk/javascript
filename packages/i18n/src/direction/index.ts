import { computed } from 'nanostores';

import type { ReadableStore } from '../types';

/** Text-direction info, as returned by `Intl.Locale.prototype.getTextInfo()`. */
interface TextInfo {
  direction: 'ltr' | 'rtl';
}

/**
 * `Intl.Locale` with the text-info accessors that newer engines expose. Both are
 * optional because TypeScript's lib types don't yet include them and older
 * runtimes lack them (`textInfo` was the pre-standard property name).
 */
interface LocaleTextInfo {
  getTextInfo?: () => TextInfo;
  textInfo?: TextInfo;
}

/**
 * Right-to-left base languages (ISO 639), used as a fallback when the runtime
 * has no `Intl.Locale` text-info accessor. Covers the scripts Clerk ships auth
 * UI for; extend as needed.
 */
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ckb']);

function resolveDirection(locale: string): 'ltr' | 'rtl' {
  try {
    // Widening annotation, not a cast: the value is a real Intl.Locale; the
    // optional members just describe accessors TS's lib types omit.
    const loc: Intl.Locale & LocaleTextInfo = new Intl.Locale(locale);
    const info = loc.getTextInfo?.() ?? loc.textInfo;
    if (info) {
      return info.direction;
    }
    return RTL_LANGUAGES.has(loc.language) ? 'rtl' : 'ltr';
  } catch {
    // Malformed locale tag: default to ltr.
    return 'ltr';
  }
}

/**
 * A reactive text-direction store derived from a locale store. Resolves to
 * `'ltr'` or `'rtl'`, following the locale. Bind it to `dir` on a container:
 *
 * ```tsx
 * const $dir = direction($locale);
 * <div dir={useStore($dir)}>…</div>
 * ```
 */
export function direction($locale: ReadableStore<string>): ReadableStore<'ltr' | 'rtl'> {
  return computed($locale, resolveDirection);
}
