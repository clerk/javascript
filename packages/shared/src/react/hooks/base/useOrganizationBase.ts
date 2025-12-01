import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { OrganizationResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useOrganizationBase(): OrganizationResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialStateContext = useInitialStateContext();
  // If we make initialState support a promise in the future, this is where we would use() that promise
  const initialSnapshot = useMemo(() => {
    if (!initialStateContext) {
      return undefined;
    }
    return initialStateContext.organization;
  }, [initialStateContext]);

  const organization = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded) {
        return initialSnapshot;
      }
      return clerk.organization;
    }, [clerk.organization, initialSnapshot, clerk.loaded]),
    useCallback(() => initialSnapshot, [initialSnapshot]),
  );

  return organization;
}
