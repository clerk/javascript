import { inBrowser } from '@clerk/shared/browser';

const DEFAULT_LOCALE = null;

/**
 * Detects the user's preferred locale from the browser.
 * Falls back to null if locale cannot be determined.
 *
 * @returns The browser's reported locale string (typically BCP 47 format like 'en-US', 'es-ES') or null if locale cannot be determined.
 */
export function getBrowserLocale(): string | null {
  if (!inBrowser()) {
    return DEFAULT_LOCALE;
  }

  try {
    // Get locale from the browser
    const locale = navigator?.language;

    // Validate that we got a non-empty string
    if (!locale || typeof locale !== 'string' || locale.trim() === '') {
      return DEFAULT_LOCALE;
    }
    return locale;
  } catch {
    return DEFAULT_LOCALE;
  }
}
