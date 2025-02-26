import type { ClerkOptions } from '@clerk/types';

import { useClerk } from '../composables/useClerk';

type ClerkUpdateOptions = Pick<ClerkOptions, 'appearance' | 'localization'>;

/**
 * Updates Clerk's appearance and localization options at runtime.
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
  const clerk = useClerk();

  // @ts-expect-error - `__unstable__updateProps` is not exposed as public API from `@clerk/types`
  void clerk.value.__unstable__updateProps({
    options: {
      locatization: options.localization,
    },
    appearance: options.appearance,
  });
}
