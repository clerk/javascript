import { signal } from 'alien-signals';

/**
 * Self-contained store for the org-profile spike. No external data dependencies — it models the
 * two distinct kinds of state the real components consume, so component code is written exactly as
 * it would be against production and only this file would be swapped:
 *
 *  - the live, client-owned org **identity** (the active organization + the current user's
 *    membership) — modelled as a signal, the synchronous source of truth;
 *  - server **collections** (members, invitations) — fetched + cached by TanStack Query, see
 *    `members-query.ts`.
 *
 * Resources carry their own mutation methods (`destroy`), mirroring the real resource API so the
 * mutation hooks call `organization.destroy()` / `membership.destroy()` rather than reaching into
 * the store.
 */

/** Time until the simulated org identity hydrates (analogue of waiting on the SDK to load). */
const LOAD_DELAY_MS = 600;
/** Artificial latency for `destroy()` mutations. */
const MUTATION_DELAY_MS = 2000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface OrganizationResource {
  id: string;
  name: string;
  slug: string | null;
  membersCount: number;
  /** Permanently delete the organization (admin-only in the real API). */
  destroy: () => Promise<void>;
}

export interface MembershipResource {
  id: string;
  /** e.g. 'org:admin' | 'org:member' */
  role: string;
  /** Leave the organization (removes the current member). */
  destroy: () => Promise<void>;
}

export interface ActiveOrganization {
  organization: OrganizationResource;
  membership: MembershipResource;
}

// read: organizationSignal() · write: organizationSignal(next)
export const organizationSignal = signal<ActiveOrganization | null>(null);

let hydration: Promise<void> | null = null;

/**
 * Resolves once the active organization is available. Idempotent — every `useOrganization()`
 * instance awaits the same promise, so independently-mounted sections suspend and resume on the
 * same tick instead of racing their own timers.
 */
export function ensureOrganization(): Promise<void> {
  if (!hydration) {
    hydration = delay(LOAD_DELAY_MS).then(() => {
      organizationSignal({
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
      });
    });
  }
  return hydration;
}
