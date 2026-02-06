import type { Ui } from './internal';
import { UI_BRAND } from './internal';
import type { Appearance } from './internal/appearance';

import { ClerkUI } from './ClerkUI';

declare const PACKAGE_VERSION: string;

/**
 * UI object for Clerk UI components.
 * Pass this to ClerkProvider to use the bundled UI.
 *
 * @example
 * ```tsx
 * import { ui } from '@clerk/ui';
 *
 * <ClerkProvider ui={ui}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const ui = {
  __brand: UI_BRAND,
  version: PACKAGE_VERSION,
  ClerkUI,
} as unknown as Ui<Appearance>;
