import { useCallback, useDeferredValue, useMemo, useSyncExternalStore } from 'react';

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

  const snapshot = useMemo(() => {
    if (!clerk.loaded) {
      return initialSnapshot;
    }
    return clerk.organization;
  }, [clerk.organization, initialSnapshot, clerk.loaded]);

  const organization = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => snapshot, [snapshot]),
    useCallback(() => initialSnapshot, [initialSnapshot]),
  );

  // If an updates comes in during a transition, uSES usually deopts that transition to be synchronous,
  // which for example means that already mounted <Suspense> boundaries might suddenly show their fallback.
  // This makes all auth state changes into transitions, but does not deopt to be synchronous. If it's
  // called during a transition, it immediately uses the new value without deferring.
  return useDeferredValue(organization);
}
