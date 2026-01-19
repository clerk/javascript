import { useEffect, useRef } from 'react';

import { useClerkQueryClient } from '../clerk-rq/use-clerk-query-client';
import { usePreviousValue } from './usePreviousValue';

export const withInfiniteKey = <T extends string>(key: T) => [key, `${key}-inf`] as const;

type ClearQueriesOnSignOutOptions = {
  isSignedOut: boolean;
  stableKeys: string | readonly string[];
  /**
   * Whether the queries for this hook are keyed as authenticated.
   * If this is not `true`, the effect becomes a no-op.
   */
  authenticated?: boolean;
  /**
   * Optional callback that will run after queries are cleared on sign-out.
   */
  onCleanup?: () => void;
};

/**
 * Clears React Query caches associated with the given stable prefixes when
 * the authenticated state transitions from signed-in to signed-out.
 *
 * @internal
 */
export function useClearQueriesOnSignOut(options: ClearQueriesOnSignOutOptions) {
  const { isSignedOut, stableKeys, authenticated = true, onCleanup } = options;
  const stableKeysRef = useRef(stableKeys);

  const [queryClient] = useClerkQueryClient();
  const previousIsSignedIn = usePreviousValue(!isSignedOut);

  useEffect(() => {
    // If this hook's cache keys are not authenticated, skip all cleanup logic.
    if (authenticated !== true) {
      return;
    }

    const isNowSignedOut = isSignedOut === true;

    if (previousIsSignedIn && isNowSignedOut && authenticated === true) {
      queryClient.removeQueries({
        predicate: query => {
          const [cachedStableKey, queryAuthenticated] = query.queryKey;

          return (
            queryAuthenticated === true &&
            typeof cachedStableKey === 'string' &&
            (Array.isArray(stableKeysRef.current)
              ? stableKeysRef.current.includes(cachedStableKey)
              : stableKeysRef.current === cachedStableKey)
          );
        },
      });

      onCleanup?.();
    }
  }, [authenticated, isSignedOut, previousIsSignedIn, queryClient]);
}
