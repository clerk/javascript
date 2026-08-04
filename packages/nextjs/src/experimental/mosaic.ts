'use client';

/**
 * Mosaic components mounted directly in the host app's tree, rather than through clerk-js. They
 * read Clerk via hooks, so a `ClerkProvider` above them is all they need.
 *
 * Pair with the stylesheet, which carries the design tokens and every component rule:
 *
 * ```css
 * @import '@clerk/nextjs/experimental/mosaic/styles.css' layer(clerk);
 * ```
 *
 * @experimental The surface and the components behind it are subject to change.
 */
export { UserButton } from '@clerk/react/experimental/mosaic';
export type { UserButtonProps } from '@clerk/react/experimental/mosaic';
