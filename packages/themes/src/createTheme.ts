import type { Appearance, BaseTheme, DeepPartial, Elements, Theme } from '@clerk/types';

export type DarkModeElementsFunction = (darkModeSelector: string) => Elements;

export function experimental_createTheme<T extends { elements: (darkModeSelector: any) => Elements }>(
  appearance: Appearance<T & DeepPartial<Theme> & { baseTheme?: BaseTheme }>,
): BaseTheme & ((options?: { darkModeSelector?: string }) => BaseTheme);
export function experimental_createTheme<T extends DeepPartial<Theme> & { baseTheme?: BaseTheme }>(
  appearance: Appearance<T>,
): BaseTheme & ((options?: { darkModeSelector?: string }) => BaseTheme);
export function experimental_createTheme(appearance: any) {
  const createTheme = (options?: { darkModeSelector?: string }) => {
    // Handle empty string darkModeSelector
    const darkModeSelector = (options?.darkModeSelector && options.darkModeSelector.trim()) || '.dark';

    // Process baseTheme if provided
    let baseThemeData: any = {};
    if (appearance.baseTheme) {
      if (typeof appearance.baseTheme === 'function') {
        // If baseTheme is a factory function, call it with the same options
        baseThemeData = appearance.baseTheme(options);
      } else {
        // If baseTheme is a static theme object
        baseThemeData = appearance.baseTheme;
      }
    }

    // Process elements - if it's a function expecting darkModeSelector, call it
    let processedElements = appearance.elements;
    if (typeof appearance.elements === 'function') {
      // Try to call the function as a darkModeSelector function first
      // This handles both regular functions and mocked functions
      try {
        // Most functions expecting darkModeSelector have length 1
        // Legacy functions typically have complex parameter destructuring
        const functionString = appearance.elements.toString();
        const isLegacyFunction =
          functionString.includes('{') && (functionString.includes('theme') || functionString.includes('params'));

        if (!isLegacyFunction) {
          // Assume it's a darkModeSelector function and call it
          processedElements = (appearance.elements as DarkModeElementsFunction)(darkModeSelector);
        } else {
          // Legacy function - leave as-is for now
          processedElements = appearance.elements;
        }
      } catch (error) {
        // If calling fails, leave as-is (might be legacy function)
        processedElements = appearance.elements;
      }
    }

    // Merge baseTheme data with current appearance, avoiding empty objects
    const mergedVariables =
      baseThemeData.variables || appearance.variables
        ? { ...baseThemeData.variables, ...appearance.variables }
        : undefined;
    const mergedElements =
      baseThemeData.elements || processedElements ? { ...baseThemeData.elements, ...processedElements } : undefined;

    const result = {
      ...baseThemeData,
      ...appearance,
      __type: 'prebuilt_appearance',
    } as BaseTheme;

    // Only set variables/elements if they have content
    if (mergedVariables) (result as any).variables = mergedVariables;
    if (mergedElements) (result as any).elements = mergedElements;

    return result;
  };

  // Create the default theme (backwards compatibility)
  const defaultTheme = createTheme();

  // Make the default theme callable as a factory function
  const callableTheme = Object.assign((...args: Parameters<typeof createTheme>) => createTheme(...args), defaultTheme);

  return callableTheme as BaseTheme & typeof createTheme;
}
