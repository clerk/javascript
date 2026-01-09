import type { UiModule, UiVersion } from './internal';
import type { Appearance } from './internal/appearance';

import { ClerkUi as ClerkUiClass } from './ClerkUi';

declare const PACKAGE_VERSION: string;

/**
 * Symbol used to identify legitimate @clerk/ui exports at runtime.
 * This prevents arbitrary objects from being passed to the ui prop.
 * @internal
 */
export const UI_BRAND_SYMBOL = Symbol.for('clerk:ui');

/**
 * Version object for Clerk UI components.
 * Use this for version pinning with hot loading from CDN.
 *
 * @example
 * import { version } from '@clerk/ui';
 * <ClerkProvider ui={version} />
 */
export const version = {
  __brand: UI_BRAND_SYMBOL,
  version: PACKAGE_VERSION,
} as UiVersion<Appearance>;

/**
 * ClerkUI class constructor for direct module usage.
 * Use this when you want to bundle @clerk/ui directly instead of hot loading.
 *
 * @example
 * import { ClerkUI } from '@clerk/ui';
 * <ClerkProvider ui={ClerkUI} />
 */
// Add the brand symbol to the class
(ClerkUiClass as any).__brand = UI_BRAND_SYMBOL;
export const ClerkUI = ClerkUiClass as unknown as UiModule<Appearance>;
