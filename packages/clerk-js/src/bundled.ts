import type { Js } from './internal';
import { JS_BRAND } from './internal';

import { Clerk } from './core/clerk';

declare const PACKAGE_VERSION: string;

/**
 * JS object for bundled Clerk JS.
 * Pass this to ClerkProvider to use the bundled clerk-js instead of loading from CDN.
 *
 * @example
 * ```tsx
 * import { js } from '@clerk/clerk-js/bundled';
 *
 * <ClerkProvider js={js}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const js = {
  __brand: JS_BRAND,
  version: PACKAGE_VERSION,
  ClerkJS: Clerk,
} as unknown as Js;

export type { Js } from './internal';
