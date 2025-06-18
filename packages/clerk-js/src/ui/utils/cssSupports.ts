type CSSFeature = 'relativeColorSyntax' | 'colorMix';

const CSS_FEATURE_TESTS: Record<CSSFeature, string> = {
  relativeColorSyntax: 'hsl(from white h s l)',
  colorMix: 'color-mix(in srgb, white, black)',
} as const;

const supportCache = new Map<CSSFeature, boolean>();

/**
 * CSS feature detection
 * @param feature - The CSS feature to test
 * @param property - CSS property to test (defaults to 'color' for most tests)
 * @returns Whether the feature is supported
 */
const testCSSFeature = (feature: CSSFeature, property: string = 'color'): boolean => {
  if (supportCache.has(feature)) {
    const cached = supportCache.get(feature);
    if (cached !== undefined) {
      return cached;
    }
  }

  let isSupported = false;

  try {
    const testValue = CSS_FEATURE_TESTS[feature];

    const testProperty = getPropertyForFeature(feature, property);

    isSupported = CSS.supports(testProperty, testValue);
  } catch {
    isSupported = false;
  }

  supportCache.set(feature, isSupported);

  return isSupported;
};

/**
 * Get the appropriate CSS property for testing a feature
 */
const getPropertyForFeature = (feature: CSSFeature, defaultProperty: string): string => {
  const propertyMap: Partial<Record<CSSFeature, string>> = {
    relativeColorSyntax: 'color',
    colorMix: 'color',
  };

  return propertyMap[feature] || defaultProperty;
};

/**
 * Check multiple CSS features at once
 * @param features - Array of features to check
 * @returns Object with feature names as keys and support status as values
 */
const checkCSSFeatures = (features: CSSFeature[]): Record<CSSFeature, boolean> => {
  return features.reduce(
    (acc, feature) => {
      acc[feature] = testCSSFeature(feature);
      return acc;
    },
    {} as Record<CSSFeature, boolean>,
  );
};

/**
 * Individual feature check functions for convenience
 * These are pre-configured and cached automatically
 */
export const cssSupports = {
  relativeColorSyntax: () => testCSSFeature('relativeColorSyntax'),
  colorMix: () => testCSSFeature('colorMix'),
} as const;

export const clearCSSSupportsCache = (): void => {
  supportCache.clear();
};

export const getCachedSupports = (): Record<string, boolean> => {
  return Object.fromEntries(supportCache.entries());
};

export { testCSSFeature, checkCSSFeatures };
export type { CSSFeature };
