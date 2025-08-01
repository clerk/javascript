// Define types locally to avoid circular imports
type CssColor = string;
type CssColorOrScale = string | object;
type CssColorOrAlphaScale = string | object;

type CssColorTuple = [CssColor, CssColor];
type CssColorOrScaleTuple = [CssColorOrScale, CssColorOrScale];
type CssColorOrAlphaScaleTuple = [CssColorOrAlphaScale, CssColorOrAlphaScale];

type CssColorWithDarkMode = CssColor | CssColorTuple;
type CssColorOrScaleWithDarkMode = CssColorOrScale | CssColorOrScaleTuple;
type CssColorOrAlphaScaleWithDarkMode = CssColorOrAlphaScale | CssColorOrAlphaScaleTuple;

export interface CreateThemeVariables {
  colorPrimary?: CssColorOrScaleWithDarkMode;
  colorDanger?: CssColorOrScaleWithDarkMode;
  colorSuccess?: CssColorOrScaleWithDarkMode;
  colorWarning?: CssColorOrScaleWithDarkMode;
  colorNeutral?: CssColorOrAlphaScaleWithDarkMode;
  colorText?: CssColorWithDarkMode;
  colorForeground?: CssColorWithDarkMode;
  colorMuted?: CssColorWithDarkMode;
  colorTextSecondary?: CssColorWithDarkMode;
  colorMutedForeground?: CssColorWithDarkMode;
  colorBackground?: CssColorWithDarkMode;
  colorInputText?: CssColorWithDarkMode;
  colorInputForeground?: CssColorWithDarkMode;
  colorInputBackground?: CssColorWithDarkMode;
  colorInput?: CssColorWithDarkMode;
  colorShimmer?: CssColorWithDarkMode;
  colorRing?: CssColorWithDarkMode;
  colorShadow?: CssColorWithDarkMode;
  colorBorder?: CssColorWithDarkMode;
  colorModalBackdrop?: CssColorWithDarkMode;
  colorTextOnPrimaryBackground?: CssColorWithDarkMode;
  colorPrimaryForeground?: CssColorWithDarkMode;
  [key: string]: any; // Allow other properties
}

// Utility to check if a value is a color tuple [light, dark]
const isColorTuple = (value: any): value is [string, string] => {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && typeof value[1] === 'string';
};

// Convert camelCase variable names to CSS custom property names
const toCSSVariableName = (key: string): string => {
  // Convert colorPrimary -> --clerk-color-primary
  return `--clerk-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
};

// Generate CSS variables from theme variables with tuple support
// Only generates CSS variables for tuple values [light, dark]
// Single values are handled by the existing theme system
export const generateCSSVariables = (variables: any, darkModeSelector: string): string => {
  if (!variables) return '';

  const lightModeRules: string[] = [];
  const darkModeRules: string[] = [];

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && key.startsWith('color')) {
      const cssVarName = toCSSVariableName(key);

      if (isColorTuple(value)) {
        // Only generate CSS variables for tuple values [light, dark]
        lightModeRules.push(`  ${cssVarName}: ${value[0]};`);
        darkModeRules.push(`  ${cssVarName}: ${value[1]};`);
      }
      // Single values and color scales are handled by the existing theme system
      // and should not generate global CSS variables
    }
  }

  let css = '';

  if (lightModeRules.length > 0) {
    css += `:root {\n${lightModeRules.join('\n')}\n}`;
  }

  if (darkModeRules.length > 0) {
    if (css) css += '\n';

    // Check if the selector is a media query
    const isMediaQuery = darkModeSelector.startsWith('@media');

    if (isMediaQuery) {
      // For media queries, wrap variables in :root {} within the media query
      css += `${darkModeSelector} {\n  :root {\n${darkModeRules.map(rule => `  ${rule}`).join('\n')}\n  }\n}`;
    } else {
      // For class/attribute selectors, use the selector directly
      css += `${darkModeSelector} {\n${darkModeRules.join('\n')}\n}`;
    }
  }

  return css;
};

// Extract dark mode information from a theme
export const extractDarkModeInfo = (
  theme: any,
): {
  originalVariables?: any;
  darkModeSelector?: string;
  supportsDarkMode?: boolean;
} => {
  if (theme && typeof theme === 'object' && theme.__internal) {
    return {
      originalVariables: theme.__internal.originalVariables,
      darkModeSelector: theme.__internal.darkModeSelector,
      supportsDarkMode: theme.__internal.supportsDarkMode,
    };
  }
  return {};
};
