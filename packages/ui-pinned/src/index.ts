import type { Ui } from '@clerk/shared/types';
import type { Appearance } from '@clerk/ui/internal';

declare const PACKAGE_VERSION: string;

/**
 * The version of @clerk/ui that this package pins to.
 *
 * @example
 * ```tsx
 * import { version } from '@clerk/ui-pinned';
 * console.log(`Pinning to @clerk/ui version ${version}`);
 * ```
 */
export const version = PACKAGE_VERSION;

/**
 * Branded object for pinning @clerk/ui version with full type support.
 * Use this with the `ui` prop in ClerkProvider for dependency-managed pinning
 * with type-safe appearance customization.
 *
 * @example
 * ```tsx
 * import { ui } from '@clerk/ui-pinned';
 *
 * <ClerkProvider
 *   ui={ui}
 *   appearance={{
 *     variables: {
 *       colorPrimary: '#000000',
 *     },
 *   }}
 * />
 * ```
 */
export const ui = {
  version: PACKAGE_VERSION,
} as Ui<Appearance>;

// Re-export types for consumers who need them
export type { Ui, ExtractAppearanceType } from '@clerk/shared/types';
export type { Appearance } from '@clerk/ui/internal';
