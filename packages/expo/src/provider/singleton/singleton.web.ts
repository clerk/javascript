import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/react';

import type { BuildClerkOptions } from './types';

/**
 * @deprecated Use `getClerkInstance()` instead. `Clerk` will be removed in the next major version.
 */
export const clerk = globalThis?.window?.Clerk;

/**
 * No need to use options here as we are not creating a new instance of Clerk, we are just getting the existing instance from the window
 */
export const getClerkInstance = (_options?: BuildClerkOptions): HeadlessBrowserClerk | BrowserClerk | undefined =>
  globalThis?.window?.Clerk;
