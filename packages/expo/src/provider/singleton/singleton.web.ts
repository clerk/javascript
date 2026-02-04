import type { BrowserClerk, HeadlessBrowserClerk } from '@clerk/react';

import type { BuildClerkOptions } from './types';

/**
 * Access the existing Clerk instance from `window.Clerk` on the web.
 * Unlike the native implementation, this does not create a new instance—it only returns the existing one set by ClerkProvider.
 */
export const getClerkInstance = (_options?: BuildClerkOptions): HeadlessBrowserClerk | BrowserClerk | undefined =>
  globalThis?.window?.Clerk;
