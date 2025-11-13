import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { UseSignInReturn } from '@clerk/shared/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

/**
 * The `useSignIn()` hook provides access to the [`SignIn`](https://clerk.com/docs/reference/javascript/sign-in) object, which allows you to check the current state of a sign-in attempt and manage the sign-in flow. You can use this to create a [custom sign-in flow](https://clerk.com/docs/guides/development/custom-flows/overview#sign-in-flow).
 *
 * @unionReturnHeadings
 * ["Initialization", "Loaded"]
 *
 * @example
 * ### Check the current state of a sign-in
 *
 * The following example uses the `useSignIn()` hook to access the [`SignIn`](https://clerk.com/docs/reference/javascript/sign-in) object, which contains the current sign-in attempt status and methods to create a new sign-in attempt. The `isLoaded` property is used to handle the loading state.
 *
 * <Tabs items='React,Next.js'>
 * <Tab>
 *
 * ```tsx {{ filename: 'src/pages/SignInPage.tsx' }}
 * import { useSignIn } from '@clerk/clerk-react'
 *
 * export default function SignInPage() {
 *   const { isLoaded, signIn } = useSignIn()
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null
 *   }
 *
 *   return <div>The current sign-in attempt status is {signIn?.status}.</div>
 * }
 * ```
 *
 * </Tab>
 * <Tab>
 *
 * {@include ../../docs/use-sign-in.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 *
 * @example
 * ### Create a custom sign-in flow with `useSignIn()`
 *
 * The `useSignIn()` hook can also be used to build fully custom sign-in flows, if Clerk's prebuilt components don't meet your specific needs or if you require more control over the authentication flow. Different sign-in flows include email and password, email and phone codes, email links, and multifactor (MFA). To learn more about using the `useSignIn()` hook to create custom flows, see the [custom flow guides](https://clerk.com/docs/guides/development/custom-flows/overview).
 *
 * ```empty```
 */
export const useSignIn = (): UseSignInReturn => {
  useAssertWrappedByClerkProvider('useSignIn');

  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  isomorphicClerk.telemetry?.record(eventMethodCalled('useSignIn'));

  if (!client) {
    return { isLoaded: false, signIn: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signIn: client.signIn,
    setActive: isomorphicClerk.setActive,
  };
};
