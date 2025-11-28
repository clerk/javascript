import type { TelemetryEventRaw } from '../../types';

export const EVENT_THEME_USAGE = 'THEME_USAGE';
export const EVENT_SAMPLING_RATE = 1;

type EventThemeUsage = {
  /**
   * The name of the theme being used (e.g., "shadcn", "neobrutalism", etc.).
   */
  themeName?: string;
};

/**
 * Helper function for `telemetry.record()`. Create a consistent event object for tracking theme usage in ClerkProvider.
 *
 * @param appearance - The appearance prop from ClerkProvider.
 * @example
 * telemetry.record(eventThemeUsage(appearance));
 */
export function eventThemeUsage(appearance?: any): TelemetryEventRaw<EventThemeUsage> {
  const payload = analyzeThemeUsage(appearance);

  return {
    event: EVENT_THEME_USAGE,
    eventSamplingRate: EVENT_SAMPLING_RATE,
    payload,
  };
}

/**
 * Analyzes the appearance prop to extract theme usage information for telemetry.
 *
 * @internal
 */
function analyzeThemeUsage(appearance?: any): EventThemeUsage {
  if (!appearance || typeof appearance !== 'object') {
    return {};
  }

  // Prioritize the new theme property over deprecated baseTheme
  const themeProperty = appearance.theme || appearance.baseTheme;

  if (!themeProperty) {
    return {};
  }

  let themeName: string | undefined;

  if (Array.isArray(themeProperty)) {
    // Look for the first identifiable theme name in the array
    for (const theme of themeProperty) {
      const name = extractThemeName(theme);
      if (name) {
        themeName = name;
        break;
      }
    }
  } else {
    themeName = extractThemeName(themeProperty);
  }

  return { themeName };
}

/**
 * Extracts the theme name from a theme object.
 *
 * @internal
 */
function extractThemeName(theme: any): string | undefined {
  if (typeof theme === 'string') {
    return theme;
  }

  if (typeof theme === 'object' && theme !== null) {
    // Check for explicit theme name
    if ('name' in theme && typeof theme.name === 'string') {
      return theme.name;
    }
  }

  return undefined;
}
