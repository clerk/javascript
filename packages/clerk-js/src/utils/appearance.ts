import type { Appearance, BaseTheme } from '@clerk/types';

/**
 * Extracts cssLayerName from baseTheme and moves it to appearance level.
 * This is a pure function that can be tested independently.
 */
export function processCssLayerNameExtraction(appearance: Appearance | undefined): Appearance | undefined {
  if (!appearance || typeof appearance !== 'object' || !('baseTheme' in appearance) || !appearance.baseTheme) {
    return appearance;
  }

  let cssLayerNameFromBaseTheme: string | undefined;

  if (Array.isArray(appearance.baseTheme)) {
    // Handle array of themes - extract cssLayerName from each and use the first one found
    appearance.baseTheme.forEach((theme: BaseTheme) => {
      if (!cssLayerNameFromBaseTheme && theme.cssLayerName) {
        cssLayerNameFromBaseTheme = theme.cssLayerName;
      }
    });

    // Create array without cssLayerName properties
    const processedBaseThemeArray = appearance.baseTheme.map((theme: BaseTheme) => {
      const { cssLayerName, ...rest } = theme;
      return rest;
    });

    // Use existing cssLayerName at appearance level, or fall back to one from baseTheme(s)
    const finalCssLayerName = appearance.cssLayerName || cssLayerNameFromBaseTheme;

    const result = {
      ...appearance,
      baseTheme: processedBaseThemeArray,
    };

    if (finalCssLayerName) {
      result.cssLayerName = finalCssLayerName;
    }

    return result;
  } else {
    // Handle single theme
    const singleTheme = appearance.baseTheme;
    let cssLayerNameFromSingleTheme: string | undefined;

    if (singleTheme.cssLayerName) {
      cssLayerNameFromSingleTheme = singleTheme.cssLayerName;
    }

    // Create new theme without cssLayerName
    const { cssLayerName, ...processedBaseTheme } = singleTheme;

    // Use existing cssLayerName at appearance level, or fall back to one from baseTheme
    const finalCssLayerName = appearance.cssLayerName || cssLayerNameFromSingleTheme;

    const result = {
      ...appearance,
      baseTheme: processedBaseTheme,
    };

    if (finalCssLayerName) {
      result.cssLayerName = finalCssLayerName;
    }

    return result;
  }
}
