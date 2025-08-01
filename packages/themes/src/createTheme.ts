// Temp way to import the type. We will clean this up when we extract
// theming into its own package
import type {
  Appearance,
  BaseTheme,
  DeepPartial,
  Elements,
  Theme,
  Variables,
  CssColor,
  CssColorOrScale,
  CssColorOrAlphaScale,
} from '@clerk/types';

import type { InternalTheme } from '../../clerk-js/src/ui/foundations';

// Dark mode support: Allow tuples [light, dark] for color values within createTheme only
type CssColorTuple = [CssColor, CssColor];
type CssColorOrScaleTuple = [CssColorOrScale, CssColorOrScale];
type CssColorOrAlphaScaleTuple = [CssColorOrAlphaScale, CssColorOrAlphaScale];

// Extended color types that support both single values and tuples for createTheme
type CssColorWithDarkMode = CssColor | CssColorTuple;
type CssColorOrScaleWithDarkMode = CssColorOrScale | CssColorOrScaleTuple;
type CssColorOrAlphaScaleWithDarkMode = CssColorOrAlphaScale | CssColorOrAlphaScaleTuple;

// Variables type with dark mode support for createTheme
export interface CreateThemeVariables
  extends Omit<
    Variables,
    | 'colorPrimary'
    | 'colorDanger'
    | 'colorSuccess'
    | 'colorWarning'
    | 'colorNeutral'
    | 'colorText'
    | 'colorForeground'
    | 'colorMuted'
    | 'colorTextSecondary'
    | 'colorMutedForeground'
    | 'colorBackground'
    | 'colorInputText'
    | 'colorInputForeground'
    | 'colorInputBackground'
    | 'colorInput'
    | 'colorShimmer'
    | 'colorRing'
    | 'colorShadow'
    | 'colorBorder'
    | 'colorModalBackdrop'
    | 'colorTextOnPrimaryBackground'
    | 'colorPrimaryForeground'
  > {
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
}

interface CreateThemeParams extends Omit<DeepPartial<Theme>, 'variables'> {
  /**
   * General theme overrides. This styles will be merged with our base theme.
   * Can override global styles like colors, fonts etc.
   * Supports [light, dark] tuples for color values when using createTheme.
   */
  variables?: CreateThemeVariables;
  /**
   * {@link Theme.elements}
   */
  elements?: Elements | ((params: { theme: InternalTheme }) => Elements);
}

type CreateThemeCallback = (darkModeSelector: string) => CreateThemeParams;

export const createTheme = (callback: CreateThemeCallback) => {
  return (options: { darkSelector: string | false }) => {
    const darkModeSelector = typeof options.darkSelector === 'string' ? options.darkSelector : '.dark';
    const themeConfig = callback(darkModeSelector);

    // Separate tuple values from single values
    const tupleVariables: any = {};
    const filteredVariables: any = {};

    if (themeConfig.variables) {
      for (const [key, value] of Object.entries(themeConfig.variables)) {
        if (Array.isArray(value) && value.length === 2) {
          // Store tuples for CSS variable generation only
          tupleVariables[key] = value;
        } else {
          // Pass single values to normal theme processing
          filteredVariables[key] = value;
        }
      }
    }

    const baseTheme: BaseTheme = {
      ...themeConfig,
      // Only pass non-tuple variables to the theme system
      variables: filteredVariables,
      __type: 'prebuilt_appearance',
      // Store tuples for CSS generation
      __internal: {
        originalVariables: tupleVariables,
        darkModeSelector,
        supportsDarkMode: Object.keys(tupleVariables).length > 0,
      },
    };

    return baseTheme;
  };
};

interface CreateClerkThemeParams extends DeepPartial<Theme> {
  /**
   * {@link Theme.elements}
   */
  elements?: Elements | ((params: { theme: InternalTheme }) => Elements);
}

export const experimental_createTheme = (appearance: Appearance<CreateClerkThemeParams>): BaseTheme => {
  // Placeholder method that might handle more transformations in the future
  return {
    ...appearance,
    __type: 'prebuilt_appearance',
  };
};
