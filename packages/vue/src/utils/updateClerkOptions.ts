import type { ClerkOptions } from '@clerk/shared/types';

type ClerkUpdateOptions = Pick<ClerkOptions, 'appearance' | 'localization'>;

/**
 * Updates Clerk's options at runtime.
 *
 * @param options - The Clerk options to update
 *
 * @example
 * import { frFR } from '@clerk/localizations';
 * import { dark } from '@clerk/themes';
 *
 * updateClerkOptions({
 *   appearance: { baseTheme: dark },
 *   localization: frFR
 * });
 */
export function updateClerkOptions(options: ClerkUpdateOptions) {
  if (!window.Clerk) {
    throw new Error('Missing Clerk instance');
  }

  // @ts-expect-error - `__unstable__updateProps` is not exposed as public API from `@clerk/types`
  void window.Clerk.__unstable__updateProps({
    options: {
      localization: options.localization,
    },
    appearance: options.appearance,
  });
}
