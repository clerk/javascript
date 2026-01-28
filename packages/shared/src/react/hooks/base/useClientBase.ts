import { useCallback, useSyncExternalStore } from 'react';

import type { ClientResource } from '@/types';

import { useClerkInstanceContext } from '../../contexts';

const initialSnapshot = undefined;
const getInitialSnapshot = () => initialSnapshot;
export function useClientBase(): ClientResource | null | undefined {
  const clerk = useClerkInstanceContext();

  const client = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded || !clerk.__internal_lastEmittedResources) {
        return initialSnapshot;
      }
      return clerk.__internal_lastEmittedResources.client;
    }, [clerk]),
    getInitialSnapshot,
  );

  return client;
}
