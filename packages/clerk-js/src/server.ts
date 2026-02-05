import type { Js } from './internal';
import { JS_BRAND } from './internal';

declare const PACKAGE_VERSION: string;

/**
 * Server-safe JS marker for React Server Components.
 *
 * This export does not include the ClerkJS constructor, making it safe to import
 * in server components. The constructor is resolved via dynamic import when needed.
 *
 * @example
 * ```tsx
 * // app/layout.tsx (server component)
 * import { ClerkProvider } from '@clerk/nextjs';
 * import { js } from '@clerk/clerk-js/bundled';
 *
 * export default function Layout({ children }) {
 *   return <ClerkProvider js={js}>{children}</ClerkProvider>;
 * }
 * ```
 */
export const js = {
  __brand: JS_BRAND,
  version: PACKAGE_VERSION,
} as unknown as Js;

export type { Js } from './internal';
