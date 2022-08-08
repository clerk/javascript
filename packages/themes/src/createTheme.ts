// Temp way to import the type. We will clean this up when we extract
// theming into its own package
import type { InternalTheme } from '@clerk/clerk-js/src/v4/foundations';
import type { Appearance, BaseTheme, Elements, Theme } from '@clerk/types';

type CreateClerkThemeParams = Theme & {
  /**
   * {@link Theme.elements}
   */
  elements?: Elements | ((params: { theme: InternalTheme }) => Elements);
};

export const unstable_createTheme = (appearance: Appearance<CreateClerkThemeParams>): BaseTheme => {
  // Placeholder method that might hande more transformations in the future
  return { ...appearance, __type: 'prebuilt_appearance' };
};
