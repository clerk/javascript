import { useClerk } from '@clerk/shared/react';
import type { DisplayConfigResource, EnvironmentResource } from '@clerk/types';

export function useDisplayConfig(): DisplayConfigResource {
  const clerk = useClerk();
  const displayConfig = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.displayConfig;
  return displayConfig;
}
