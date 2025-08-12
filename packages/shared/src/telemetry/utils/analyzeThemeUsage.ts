import type { Appearance, BaseTheme } from '@clerk/types';

type ThemeUsageAnalysis = {
  themeName?: string;
};

/**
 * Analyzes the appearance prop to extract theme usage information for telemetry.
 */
export function analyzeThemeUsage(appearance?: Appearance): ThemeUsageAnalysis {
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
 */
function extractThemeName(theme: BaseTheme): string | undefined {
  if (typeof theme === 'string') {
    return theme;
  }

  if (typeof theme === 'object' && theme !== null) {
    // Check for explicit theme name
    if ('__themeName' in theme && typeof theme.__themeName === 'string') {
      return theme.__themeName;
    }
  }

  return undefined;
}
