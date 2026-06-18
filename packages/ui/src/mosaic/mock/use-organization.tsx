import { useEffect, useState } from 'react';

import { delay, LOAD_DELAY_MS, MUTATION_DELAY_MS } from './organization-store';

/**
 * Mock `useOrganization` for prototyping Mosaic organization-profile components.
 *
 * Mirrors the shape of the real hook in
 * `packages/shared/src/react/hooks/useOrganization.tsx`: a
 * `{ isLoaded, organization, membership }` discriminated union where
 * `organization.destroy()` deletes the org and `membership.destroy()` leaves it.
 *
 * Loading state is held in local component state and flips to "loaded" after a
 * simulated delay. Simulated async only — no real SDK.
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
  // Starts `false` so SSR markup matches the first client render, then flips after the delay.
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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
