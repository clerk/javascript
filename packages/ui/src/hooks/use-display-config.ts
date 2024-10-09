import { useClerk } from '@clerk/shared/react';
import type { EnvironmentResource } from '@clerk/types';

export function useDisplayConfig() {
  const clerk = useClerk();
  const displayConfig = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.displayConfig;
  return displayConfig;
}
