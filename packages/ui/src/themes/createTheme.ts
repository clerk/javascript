import type { DeepPartial } from '@clerk/shared/types';

import type { InternalTheme } from '../foundations';
import type { BaseTheme, Elements, Theme } from '../internal/appearance';

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

export const createTheme = (themeParams: CreateClerkThemeParams) => {
  // Placeholder method that might hande more transformations in the future
  return {
    ...themeParams,
    __type: 'prebuilt_appearance' as const,
  };
};
