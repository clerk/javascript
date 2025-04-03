import type { PendingSessionOptions, UseSessionReturn } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useOptionsContext, useSessionContext } from '../contexts';

type UseSession = (options?: PendingSessionOptions) => UseSessionReturn;

/**
 * The `useSession()` hook provides access to the current user's [`Session`](https://clerk.com/docs/references/javascript/session) object, as well as helpers for setting the active session.
 *
 * @function
 *
 * @example
 * ### Access the `Session` object
 *
 * The following example uses the `useSession()` hook to access the `Session` object, which has the `lastActiveAt` property. The `lastActiveAt` property is a `Date` object used to show the time the session was last active.
 *
 * <Tabs items='React,Next.js'>
 * <Tab>
 *
 * ```tsx {{ filename: 'src/Home.tsx' }}
 * import { useSession } from '@clerk/clerk-react'
 *
 * export default function Home() {
 *   const { isLoaded, session, isSignedIn } = useSession()
 *
 *   if (!isLoaded) {
 *     // Handle loading state
 *     return null
 *   }
 *   if (!isSignedIn) {
 *     // Handle signed out state
 *     return null
 *   }
 *
 *   return (
 *     <div>
 *       <p>This session has been active since {session.lastActiveAt.toLocaleString()}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * </Tab>
 * <Tab>
 *
 * {@include ../../../docs/use-session.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 */
export const useSession: UseSession = (options = {}) => {
  useAssertWrappedByClerkProvider('useSession');

  const session = useSessionContext();
  const optionsContext = useOptionsContext();

  if (session === undefined) {
    return { isLoaded: false, isSignedIn: undefined, session: undefined };
  }

  const pendingAsSignedOut =
    session?.status === 'pending' &&
    (options.treatPendingAsSignedOut ?? optionsContext.treatPendingAsSignedOut ?? true);
  const isSignedOut = session === null || pendingAsSignedOut;
  if (isSignedOut) {
    return { isLoaded: true, isSignedIn: false, session: null };
  }

  return { isLoaded: true, isSignedIn: true, session };
};
