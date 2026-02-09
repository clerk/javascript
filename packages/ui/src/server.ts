import type { Ui } from './internal';
import { UI_BRAND } from './internal';
import type { Appearance } from './internal/appearance';

declare const PACKAGE_VERSION: string;

/**
 * Server-safe UI marker for React Server Components.
 *
 * This export does not include the ClerkUI constructor, making it safe to import
 * in server components. The constructor is resolved via dynamic import when needed.
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
} as unknown as Ui<Appearance>;
