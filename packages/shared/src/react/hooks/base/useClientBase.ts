import { useCallback, useDeferredValue, useSyncExternalStore } from 'react';

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

  // If an updates comes in during a transition, uSES usually deopts that transition to be synchronous,
  // which for example means that already mounted <Suspense> boundaries might suddenly show their fallback.
  // This makes all auth state changes into transitions, but does not deopt to be synchronous. If it's
  // called during a transition, it immediately uses the new value without deferring.
  return useDeferredValue(client);
}
