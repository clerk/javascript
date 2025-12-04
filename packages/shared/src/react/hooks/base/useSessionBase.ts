import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { SignedInSessionResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useSessionBase(): SignedInSessionResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialStateContext = useInitialStateContext();
  // If we make initialState support a promise in the future, this is where we would use() that promise
  const initialSnapshot = useMemo(() => {
    if (!initialStateContext) {
      return undefined;
    }
    return initialStateContext.session as SignedInSessionResource;
  }, [initialStateContext]);

  const session = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded) {
        return initialSnapshot;
      }
      return clerk.session;
    }, [clerk.session, initialSnapshot, clerk.loaded]),
    useCallback(() => initialSnapshot, [initialSnapshot]),
  );

  return session;
}
