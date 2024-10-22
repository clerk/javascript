'use client';

import { useAuth } from '@clerk/clerk-react';
import { useDerivedAuth } from '@clerk/clerk-react/internal';
import type { InitialState } from '@clerk/types';
import { useRouter } from 'next/compat/router';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import React from 'react';

const PromisifiedAuthContext = React.createContext<Promise<InitialState> | InitialState | null>(null);

export function PromisifiedAuthProvider({
  authPromise,
  children,
}: {
  authPromise: Promise<InitialState> | InitialState;
  children: React.ReactNode;
}) {
  return <PromisifiedAuthContext.Provider value={authPromise}>{children}</PromisifiedAuthContext.Provider>;
}

/**
 * Returns the current auth state, the user and session ids and the `getToken`
 * that can be used to retrieve the given template or the default Clerk token.
 *
 * Until Clerk loads, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access the `userId` and `sessionId` variables.
 *
 * For projects using NextJs or Remix, you can have immediate access to this data during SSR
 * simply by using the `ClerkProvider`.
 *
 * @example
 * A simple example:
 *
 * import { useAuth } from '@clerk/nextjs'
 *
 * function Hello() {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   if(isSignedIn) {
 *     return null;
 *   }
 *   console.log(sessionId, userId)
 *   return <div>...</div>
 * }
 *
 * @example
 * Basic example in a NextJs app. This page will be fully rendered during SSR:
 *
 * import { useAuth } from '@clerk/nextjs'
 *
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 */
export function usePromisifiedAuth() {
  const isPagesRouter = useRouter();
  const valueFromContext = React.useContext(PromisifiedAuthContext);

  let resolvedData = valueFromContext;
  if (valueFromContext && 'then' in valueFromContext) {
    resolvedData = React.use(valueFromContext);
  }

  // At this point we should have a usable auth object

  if (typeof window === 'undefined') {
    // Pages router should always use useAuth as it is able to grab initial auth state from context during SSR.
    if (isPagesRouter) {
      return useAuth();
    }

    if (!resolvedData && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
      throw new Error(
        'Clerk: useAuth() called in static mode, wrap this component in <ClerkProvider dynamic> to make auth data available during server-side rendering.',
      );
    }
    // We don't need to deal with Clerk being loaded here
    return useDerivedAuth(resolvedData);
  } else {
    return useAuth(resolvedData);
  }
}
