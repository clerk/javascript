import { effect } from 'alien-signals';
import { useSyncExternalStore } from 'react';

import { delay, MUTATION_DELAY_MS, orgLoadedSignal, startOrgLoad } from './organization-store';

/**
 * Mock `useOrganization` for prototyping Mosaic organization-profile components.
 *
 * Mirrors the shape of the real hook in
 * `packages/shared/src/react/hooks/useOrganization.tsx`: a
 * `{ isLoaded, organization, membership }` discriminated union where
 * `organization.destroy()` deletes the org and `membership.destroy()` leaves it.
 *
 * Loading state is read from a shared module-level signal via `useSyncExternalStore`,
 * the same bridge the real signal-based hooks use
 * (`packages/react/src/hooks/useClerkSignal.ts`). Simulated async only — no real SDK.
 */

export interface MockOrganization {
  id: string;
  name: string;
  slug: string | null;
  membersCount: number;
  /** Delete the entire organization (admin-only in the real API). */
  destroy: () => Promise<void>;
}

export interface MockMembership {
  id: string;
  /** e.g. 'org:admin' | 'org:member' */
  role: string;
  /** Leave the organization (removes the current member). */
  destroy: () => Promise<void>;
}

// Mirrors the real discriminated union: while loading, every field is `undefined`.
export type UseOrganizationReturn =
  | { isLoaded: false; organization: undefined; membership: undefined }
  | { isLoaded: true; organization: MockOrganization | null; membership: MockMembership | null };

export function useOrganization(): UseOrganizationReturn {
  const isLoaded = useSyncExternalStore(
    callback => {
      startOrgLoad();
      // effect re-runs whenever the signal changes; returns its dispose fn for cleanup.
      return effect(() => {
        orgLoadedSignal();
        callback();
      });
    },
    () => orgLoadedSignal(),
    () => false, // server snapshot — stays unloaded, so SSR markup matches first client render.
  );

  if (!isLoaded) {
    return { isLoaded: false, organization: undefined, membership: undefined };
  }

  return {
    isLoaded: true,
    organization: {
      id: 'org_mock',
      name: "Alex's Organization",
      slug: 'alex-org',
      membersCount: 4,
      destroy: () => delay(MUTATION_DELAY_MS),
    },
    membership: {
      id: 'mem_mock',
      role: 'org:admin',
      destroy: () => delay(MUTATION_DELAY_MS),
    },
  };
}
