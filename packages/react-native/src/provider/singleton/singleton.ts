import { Clerk } from '@clerk/clerk-js/headless';

import { createClerkInstance } from './createClerkInstance';

/**
 * @deprecated Use `getClerkInstance` instead. `Clerk` will be removed in the next major version.
 */
export { clerk } from './createClerkInstance';

/**
 * Access or create a Clerk instance outside of React. If you are using it in
 * React Native Web then it will only access the existing instance from
 * `window.Clerk`
 * @example
 * import { ClerkProvider, getClerkInstance } from "@clerk/react-native"
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
