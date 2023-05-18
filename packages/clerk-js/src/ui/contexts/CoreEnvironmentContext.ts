import { assertContextExists, EnvironmentContext, useEnvironmentContext } from '@clerk/shared';
import type { EnvironmentResource } from '@clerk/types';

export const CoreEnvironmentContext = EnvironmentContext;

export function useCoreEnvironment(): EnvironmentResource {
  const ctx = useEnvironmentContext();
  assertContextExists(ctx, EnvironmentContext);
  return ctx;
}
