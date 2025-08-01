import type { Appearance, BaseTheme, DeepPartial, Elements, Theme } from '@clerk/types';

import type { InternalTheme } from '../../clerk-js/src/ui/foundations';

type LegacyElementsFunction = (params: { theme: InternalTheme }) => Elements;
export type DarkModeElementsFunction = (darkModeSelector: string) => Elements;

// Conditional type to properly infer function parameter types
type InferElementsFunction<T> = T extends { elements: infer E }
  ? E extends (darkModeSelector: any) => Elements
    ? (darkModeSelector: string) => Elements
    : E extends (params: { theme: InternalTheme }) => Elements
      ? (params: { theme: InternalTheme }) => Elements
      : E
  : Elements | undefined;

// Function overloads for proper type inference
export function experimental_createTheme<T extends { elements: (darkModeSelector: any) => Elements }>(
  appearance: Appearance<T & DeepPartial<Theme> & { baseTheme?: BaseTheme }>,
): BaseTheme & ((options?: { darkModeSelector?: string }) => BaseTheme);
export function experimental_createTheme<T extends DeepPartial<Theme> & { baseTheme?: BaseTheme }>(
  appearance: Appearance<T>,
): BaseTheme & ((options?: { darkModeSelector?: string }) => BaseTheme);
export function experimental_createTheme(appearance: any) {
  const createTheme = (options?: { darkModeSelector?: string }) => {
    console.log('darkModeSelector:', options?.darkModeSelector);

    const darkModeSelector = options?.darkModeSelector || '.dark';

    // Process elements - if it's a function expecting darkModeSelector, call it
    let processedElements = appearance.elements;
    if (typeof appearance.elements === 'function') {
      // Check function parameter count - darkModeSelector functions have 1 param, legacy have 1 object param
      // We differentiate by checking if first parameter name suggests it's darkModeSelector
      const functionString = appearance.elements.toString();
      const isLegacyFunction =
        functionString.includes('{') && (functionString.includes('theme') || functionString.includes('params'));

      if (!isLegacyFunction && appearance.elements.length === 1) {
        // New darkModeSelector function - call it with the selector
        processedElements = (appearance.elements as DarkModeElementsFunction)(darkModeSelector);
      } else {
        // Legacy function - leave as-is for now
        processedElements = appearance.elements;
      }
    }

    return {
      ...appearance,
      elements: processedElements,
      __type: 'prebuilt_appearance',
    } as BaseTheme;
  };

  // Create the default theme (backwards compatibility)
  const defaultTheme = createTheme();

  // Make the default theme callable as a factory function
  const callableTheme = Object.assign((...args: Parameters<typeof createTheme>) => createTheme(...args), defaultTheme);

  return callableTheme as BaseTheme & typeof createTheme;
}
