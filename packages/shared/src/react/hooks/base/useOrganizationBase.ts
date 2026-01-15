import { useCallback, useSyncExternalStore } from 'react';

import type { OrganizationResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useOrganizationBase(): OrganizationResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialState = useInitialStateContext();

  const getInitialState = useCallback(() => initialState?.organization, [initialState?.organization]);

  const organization = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded) {
        return getInitialState();
      }
      return clerk.organization;
    }, [clerk, getInitialState]),
    getInitialState,
  );

  return organization;
}
