import type { UiModule, UiVersion } from './internal';
import type { Appearance } from './internal/appearance';

import { ClerkUi as ClerkUiClass } from './ClerkUi';

declare const PACKAGE_VERSION: string;

/**
 * Default ui object for Clerk UI components
 * Tagged with the internal Appearance type for type-safe appearance prop inference
 * Used for version pinning with hot loading
 */
export const ui = {
  version: PACKAGE_VERSION,
} as UiVersion<Appearance>;

/**
 * ClerkUI class constructor for direct module usage
 * Use this when you want to bundle @clerk/ui directly instead of hot loading
 * Tagged with the internal Appearance type for type-safe appearance prop inference
 */
export const ClerkUI = ClerkUiClass as unknown as UiModule<Appearance>;
