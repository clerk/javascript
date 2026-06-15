/**
 * Mock timing constants for the org-profile prototype.
 *
 * Simulated async only — no real SDK. The loading state itself lives in local
 * component state in `useOrganization()`.
 */

/** Time until the simulated org load resolves. */
export const LOAD_DELAY_MS = 600;
/** Artificial latency for `destroy()` mutations. */
export const MUTATION_DELAY_MS = 2000;

export const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
