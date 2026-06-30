import { useClerk } from '@clerk/shared/react';
import type { EnvironmentResource } from '@clerk/shared/types';

/**
 * The single seam through which Mosaic reads the active Clerk environment.
 *
 * In the app-direct model (`ClerkProvider` → `MosaicProvider` → component) clerk-js's
 * own `useEnvironment()` context is not mounted, so the only host-agnostic way to reach
 * the environment is `clerk.__internal_environment`. Quarantining that one private
 * access here keeps the `@ts-expect-error` out of every caller: read whatever field you
 * need (`displayConfig`, `authConfig`, …) off the returned resource.
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
