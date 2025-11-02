const CSS_FEATURE_TESTS: Record<string, string> = {
  relativeColorSyntax: 'color: hsl(from white h s l)',
  colorMix: 'color: color-mix(in srgb, white, black)',
} as const;

let SUPPORTS_RELATIVE_COLOR: boolean | undefined;
let SUPPORTS_COLOR_MIX: boolean | undefined;
let SUPPORTS_MODERN_COLOR: boolean | undefined;

export const cssSupports = {
  relativeColorSyntax: () => {
    if (SUPPORTS_RELATIVE_COLOR !== undefined) {
      return SUPPORTS_RELATIVE_COLOR;
    }
    try {
      SUPPORTS_RELATIVE_COLOR = CSS.supports(CSS_FEATURE_TESTS.relativeColorSyntax);
    } catch {
      SUPPORTS_RELATIVE_COLOR = false;
    }

    return SUPPORTS_RELATIVE_COLOR;
  },
  colorMix: () => {
    if (SUPPORTS_COLOR_MIX !== undefined) {
      return SUPPORTS_COLOR_MIX;
    }
    try {
      SUPPORTS_COLOR_MIX = CSS.supports(CSS_FEATURE_TESTS.colorMix);
    } catch {
      SUPPORTS_COLOR_MIX = false;
    }

    return SUPPORTS_COLOR_MIX;
  },
  /**
   * Returns true if either relativeColorSyntax or colorMix is supported
   */
  modernColor() {
    if (SUPPORTS_MODERN_COLOR !== undefined) {
      return SUPPORTS_MODERN_COLOR;
    }
    try {
      SUPPORTS_MODERN_COLOR = this.relativeColorSyntax() || this.colorMix();
    } catch {
      SUPPORTS_MODERN_COLOR = false;
    }

    return SUPPORTS_MODERN_COLOR;
  },
};

export const clearCache = () => {
  SUPPORTS_RELATIVE_COLOR = undefined;
  SUPPORTS_COLOR_MIX = undefined;
  SUPPORTS_MODERN_COLOR = undefined;
};
