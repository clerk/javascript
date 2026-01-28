import type { ClerkJs } from '@clerk/shared/types';

declare const PACKAGE_VERSION: string;

/**
 * The version of @clerk/clerk-js that this package pins to.
 * Use this with the `clerkJSVersion` prop for string-based pinning.
 *
 * @example
 * ```tsx
 * import { version } from '@clerk/clerk-js-pinned';
 * <ClerkProvider clerkJSVersion={version} />
 * ```
 */
export const version = PACKAGE_VERSION;

/**
 * Branded object for pinning @clerk/clerk-js version.
 * Use this with the `clerkJs` prop in ClerkProvider for dependency-managed pinning.
 *
 * @example
 * ```tsx
 * import { clerkJs } from '@clerk/clerk-js-pinned';
 * <ClerkProvider clerkJs={clerkJs} />
 * ```
 */
export const clerkJs = {
  version: PACKAGE_VERSION,
} as ClerkJs;

// Re-export the type for consumers who need it
export type { ClerkJs } from '@clerk/shared/types';
