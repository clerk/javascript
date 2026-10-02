import { useClerk } from '@clerk/shared/react';
import type { EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
import { useEffect, useReducer } from 'react';

/**
 * The single seam through which Mosaic reads the active Clerk environment.
 *
 * In the app-direct model (`ClerkProvider` → `MosaicProvider` → component) clerk-js's
 * own `useEnvironment()` context is not mounted, so the only host-agnostic way to reach
 * the environment is `clerk.__internal_environment`. Quarantining that one private
 * access here keeps the `@ts-expect-error` out of every caller.
 *
 * Returns `undefined` until the environment hydrates; callers should handle that.
 */
export function useMosaicEnvironment(): EnvironmentResource | undefined {
  const clerk = useClerk();
  const [, notify] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    const unsubscribe = clerk.addListener(notify, { skipInitialEmit: true });
    notify();
    return unsubscribe;
  }, [clerk]);

  return getMosaicEnvironment(clerk);
}

export function getMosaicEnvironment(clerk: LoadedClerk): EnvironmentResource | undefined {
  // @ts-expect-error -- `__internal_environment` is a private Clerk surface for now.
  // SAFETY: read-only access to the loaded environment resource, mirroring
  // components/devPrompts/KeylessPrompt/use-revalidate-environment.ts.
  return clerk.__internal_environment ?? undefined;
}
