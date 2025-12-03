import type { ClerkOptions } from '@clerk/shared/types';
import type { Appearance, Ui } from '@clerk/ui/internal';

type ClerkUpdateOptions<TUi extends Ui = Ui> = Pick<ClerkOptions, 'localization'> & {
  appearance?: Appearance<TUi>;
};

/**
 * Updates Clerk's options at runtime.
 *
 * @param options - The Clerk options to update
 *
 * @example
 * import { frFR } from '@clerk/localizations';
 * import { dark } from '@clerk/ui/themes';
 *
 * updateClerkOptions({
 *   appearance: { baseTheme: dark },
 *   localization: frFR
 * });
 */
export function updateClerkOptions<TUi extends Ui = Ui>(options: ClerkUpdateOptions<TUi>) {
  if (!window.Clerk) {
    throw new Error('Missing Clerk instance');
  }

  const updateOptions = {
    options: {
      localization: options.localization,
    },
    appearance: options.appearance,
  } as unknown as { options: any; appearance?: any };

  // @ts-expect-error - `__internal_updateProps` is not exposed as public API from `@clerk/types`
  void window.Clerk.__internal_updateProps(updateOptions);
}
