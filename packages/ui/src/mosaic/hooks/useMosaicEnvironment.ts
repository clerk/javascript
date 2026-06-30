import { useClerk } from '@clerk/shared/react';
import type { EnvironmentResource } from '@clerk/shared/types';

/**
 * The single seam through which Mosaic reads the active Clerk environment.
 *
 * In the app-direct model (`ClerkProvider` → `MosaicProvider` → component) clerk-js's
 * own `useEnvironment()` context is not mounted, so the only host-agnostic way to reach
 * the environment is `clerk.__internal_environment`. Quarantining that one private
 * access here keeps the `@ts-expect-error` out of every caller.
 *
 * This is a one-shot read off the Clerk singleton, NOT a reactive subscription: unlike
 * clerk-js's `EnvironmentProvider`, `useClerk()` does not re-render when the environment
 * mutates. So only read fields that are set once at hydration and never change at runtime
 * (e.g. static `displayConfig` URLs). Anything that can mutate post-hydration
 * (`authConfig.claimedAt`, live config toggles) will render stale through this hook and
 * needs a real reactive subscription instead (see `use-revalidate-environment.ts`).
 *
 * Returns `undefined` until the environment hydrates; callers should handle that.
 */
export function useMosaicEnvironment(): EnvironmentResource | undefined {
  const clerk = useClerk();
  // @ts-expect-error -- `__internal_environment` is a private Clerk surface for now.
  // SAFETY: read-only access to the loaded environment resource, mirroring
  // components/devPrompts/KeylessPrompt/use-revalidate-environment.ts.
  return clerk.__internal_environment ?? undefined;
}
