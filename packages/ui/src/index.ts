import type { Ui } from './internal';
import type { Appearance } from './internal/appearance';

import { ClerkUi } from './ClerkUi';

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
  version: PACKAGE_VERSION,
  ctor: ClerkUi,
} as Ui<Appearance>;
