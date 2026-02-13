import { Clerk } from '@clerk/clerk-js';

import { createClerkInstance } from './createClerkInstance';

/**
 * Access or create a Clerk instance outside of React. If you are using it in Expo Web then it will only access the existing instance from `window.Clerk`
 * @example
 * import { ClerkProvider, getClerkInstance } from "@clerk/expo"
 *
 * const clerkInstance = getClerkInstance({ publishableKey: 'xxxx' })
 *
 * // Always pass the `publishableKey` to `ClerkProvider`
 * <ClerkProvider publishableKey={'xxxx'}>
 *     ...
 * </ClerkProvider>
 *
 * // Somewhere in your code, outside of React you can do
 * const token = await clerkInstance.session?.getToken();
 * fetch('http://example.com/', {headers: {Authorization: token })
 *
 * @throws MissingPublishableKeyError publishableKey is missing and Clerk has not been initialized yet
 * @returns HeadlessBrowserClerk | BrowserClerk
 */
export const getClerkInstance = createClerkInstance(Clerk);
