const CSS_FEATURE_TESTS: Record<string, string> = {
  relativeColorSyntax: 'color: hsl(from white h s l)',
  colorMix: 'color: color-mix(in srgb, white, black)',
  lightDark: 'color: light-dark(white, black)',
} as const;

let SUPPORTS_RELATIVE_COLOR: boolean | undefined;
let SUPPORTS_COLOR_MIX: boolean | undefined;
let SUPPORTS_MODERN_COLOR: boolean | undefined;
let SUPPORTS_LIGHT_DARK: boolean | undefined;

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
  /**
   * Returns true if the light-dark() CSS function is supported
   */
  lightDark: () => {
    if (SUPPORTS_LIGHT_DARK !== undefined) {
      return SUPPORTS_LIGHT_DARK;
    }
    try {
      SUPPORTS_LIGHT_DARK = CSS.supports(CSS_FEATURE_TESTS.lightDark);
    } catch {
      SUPPORTS_LIGHT_DARK = false;
    }

    return SUPPORTS_LIGHT_DARK;
  },
};

export const clearCache = () => {
  SUPPORTS_RELATIVE_COLOR = undefined;
  SUPPORTS_COLOR_MIX = undefined;
  SUPPORTS_MODERN_COLOR = undefined;
  SUPPORTS_LIGHT_DARK = undefined;
};
