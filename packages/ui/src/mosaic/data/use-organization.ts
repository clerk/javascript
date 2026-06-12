import { effect } from 'alien-signals';
import { useSyncExternalStore } from 'react';

import { type ActiveOrganization, ensureOrganization, organizationSignal } from './organization-store';

/**
 * The active organization (and the current user's membership) via a signal — the synchronous
 * source of truth.
 *
 * Suspends (throws the hydration promise) until hydrated, then returns a plain non-null value.
 * That single move deletes the `{ isLoaded } | ...` union and the `if (!isLoaded) return <Skeleton/>`
 * branch from every consumer: a Suspense boundary above owns the loading state instead.
 */
export function useOrganization(): ActiveOrganization {
  const active = useSyncExternalStore(
    callback =>
      effect(() => {
        organizationSignal();
        callback();
      }),
    () => organizationSignal(),
    () => null, // server snapshot: unhydrated → boundary renders fallback, matching first client render.
  );

  if (!active) {
    throw ensureOrganization();
  }

  return active;
}
