import { useCallback, useSyncExternalStore } from 'react';

import type { ClientResource } from '@/types';

import { useClerkInstanceContext } from '../../contexts';

const initialSnapshot = undefined;
export function useClientBase(): ClientResource | null | undefined {
  const clerk = useClerkInstanceContext();

  const client = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded) {
        return initialSnapshot;
      }
      return clerk.client;
    }, [clerk.client, initialSnapshot, clerk.loaded]),
    useCallback(() => initialSnapshot, []),
  );

  return client;
}
