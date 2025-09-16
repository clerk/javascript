// Temp way to import the type. We will clean this up when we extract
// theming into its own package
import type { BaseTheme, DeepPartial, Elements, Theme } from '@clerk/types';

import type { InternalTheme } from '../../clerk-js/src/ui/foundations';

interface CreateClerkThemeParams extends DeepPartial<Theme>, Pick<BaseTheme, 'cssLayerName'> {
  /**
   * Optional name for the theme, used for telemetry and debugging.
   * @example 'shadcn', 'neobrutalism', 'custom-dark'
   */
  name?: string;

  /**
   * {@link Theme.elements}
   */
  elements?: Elements | ((params: { theme: InternalTheme }) => Elements);
}

export const experimental_createTheme = (themeParams: CreateClerkThemeParams) => {
  // Placeholder method that might hande more transformations in the future
  return {
    ...themeParams,
    __type: 'prebuilt_appearance' as const,
  };
};
