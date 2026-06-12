import { signal } from 'alien-signals';

/**
 * Module-level mock store for the org-profile prototype.
 *
 * Mirrors the signal-based architecture the real Clerk hooks now use
 * (`packages/clerk-js/src/core/signals.ts` + the `useSyncExternalStore` bridge in
 * `packages/react/src/hooks/useClerkSignal.ts`). One signal is shared by every
 * `useOrganization()` instance, so independently-mounted `<LeaveOrganization />` and
 * `<DeleteOrganization />` flip to "loaded" on the same tick instead of racing their
 * own timers.
 */

/** Time until the simulated org load resolves. */
const LOAD_DELAY_MS = 600;
/** Artificial latency for `destroy()` mutations. */
export const MUTATION_DELAY_MS = 2000;

// read: orgLoadedSignal() · write: orgLoadedSignal(next)
export const orgLoadedSignal = signal(false);

let started = false;

/** Idempotently kicks the simulated load. Called client-side from the hook's subscribe. */
export function startOrgLoad(): void {
  if (started) {
    return;
  }
  started = true;
  setTimeout(() => orgLoadedSignal(true), LOAD_DELAY_MS);
}

export const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
