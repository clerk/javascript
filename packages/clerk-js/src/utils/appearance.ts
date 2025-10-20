import type { Appearance, BaseTheme } from '@clerk/shared/types';

/**
 * Extracts cssLayerName from theme/baseTheme and moves it to appearance level.
 * Handles both the new 'theme' property and deprecated 'baseTheme' property.
 */
export function processCssLayerNameExtraction(appearance: Appearance | undefined): Appearance | undefined {
  if (!appearance || typeof appearance !== 'object') {
    return appearance;
  }

  // Use new 'theme' property if available, otherwise fall back to deprecated 'baseTheme'
  const themeProperty = appearance.theme !== undefined ? appearance.theme : appearance.baseTheme;
  const isUsingNewThemeProperty = appearance.theme !== undefined;

  if (!themeProperty) {
    return appearance;
  }

  let cssLayerNameFromTheme: string | undefined;

  if (Array.isArray(themeProperty)) {
    // Handle array of themes - extract cssLayerName from each and use the first one found
    themeProperty.forEach((theme: BaseTheme) => {
      if (!cssLayerNameFromTheme && typeof theme === 'object' && theme.cssLayerName) {
        cssLayerNameFromTheme = theme.cssLayerName;
      }
    });

    // Create array without cssLayerName properties (only for object themes)
    const processedThemeArray = themeProperty.map((theme: BaseTheme) => {
      if (typeof theme === 'string') {
        return theme; // String themes don't have cssLayerName
      }
      const { cssLayerName, ...rest } = theme;
      return rest;
    });

    // Use existing cssLayerName at appearance level, or fall back to one from theme(s)
    const finalCssLayerName = appearance.cssLayerName || cssLayerNameFromTheme;

    const result = {
      ...appearance,
      [isUsingNewThemeProperty ? 'theme' : 'baseTheme']: processedThemeArray,
    };

    if (finalCssLayerName) {
      result.cssLayerName = finalCssLayerName;
    }

    return result;
  } else {
    // Handle single theme
    let cssLayerNameFromSingleTheme: string | undefined;

    // Only extract cssLayerName if it's an object theme
    if (typeof themeProperty === 'object' && themeProperty.cssLayerName) {
      cssLayerNameFromSingleTheme = themeProperty.cssLayerName;
    }

    // Create new theme without cssLayerName (only for object themes)
    const processedTheme =
      typeof themeProperty === 'string'
        ? themeProperty
        : (() => {
            const { cssLayerName, ...rest } = themeProperty;
            return rest;
          })();

    // Use existing cssLayerName at appearance level, or fall back to one from theme
    const finalCssLayerName = appearance.cssLayerName || cssLayerNameFromSingleTheme;

    const result = {
      ...appearance,
      [isUsingNewThemeProperty ? 'theme' : 'baseTheme']: processedTheme,
    };

    if (finalCssLayerName) {
      result.cssLayerName = finalCssLayerName;
    }

    return result;
  }
}
