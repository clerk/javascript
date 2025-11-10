'use client';

import { useAuth } from '@clerk/react';
import { useDerivedAuth } from '@clerk/react/internal';
import type { InitialState } from '@clerk/shared/types';
import { useRouter } from 'next/compat/router';
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
 * This page will be fully rendered during SSR.
 *
 * ```tsx
 * import { useAuth } from '@clerk/nextjs'
 *
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 * ```
 */
export function usePromisifiedAuth(options: Parameters<typeof useAuth>[0] = {}) {
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
      return useAuth(options);
    }

    // We don't need to deal with Clerk being loaded here
    return useDerivedAuth({ ...resolvedData, ...options });
  } else {
    return useAuth({ ...resolvedData, ...options });
  }
}
