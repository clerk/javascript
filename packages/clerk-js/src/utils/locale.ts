import { inBrowser } from '@clerk/shared/browser';

const DEFAULT_LOCALE = 'en-US';

/**
 * Detects the user's preferred locale from the browser.
 * Falls back to 'en-US' if locale cannot be determined.
 *
 * @returns The detected locale string in BCP 47 format (e.g., 'en-US', 'es-ES')
 */
export function getBrowserLocale(): string {
  if (!inBrowser()) {
    return DEFAULT_LOCALE;
  }

  // Get locale from the browser
  const locale = navigator?.language;

  // Validate that we got a non-empty string
  if (!locale || typeof locale !== 'string' || locale.trim() === '') {
    return DEFAULT_LOCALE;
  }

  return locale;
}
