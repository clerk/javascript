import type { Ui } from './internal';
import { UI_BRAND } from './internal';
import type { Appearance } from './internal/appearance';

import { ClerkUI } from './entry';

declare const PACKAGE_VERSION: string;

/**
 * UI object for React Server Components.
 *
 * ClerkUI is imported from a 'use client' module so that RSC serializes it as a
 * client reference. The bundler includes the actual ClerkUI code only in the
 * client bundle and resolves the reference automatically on hydration.
 *
 * @example
 * ```tsx
 * // app/layout.tsx (server component)
 * import { ClerkProvider } from '@clerk/nextjs';
 * import { ui } from '@clerk/ui';
 *
 * export default function Layout({ children }) {
 *   return <ClerkProvider ui={ui}>{children}</ClerkProvider>;
 * }
 * ```
 */
export const ui = {
  __brand: UI_BRAND,
  version: PACKAGE_VERSION,
  ClerkUI,
} as unknown as Ui<Appearance>;
