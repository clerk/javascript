import { useClerk } from '@clerk/clerk-react';
import type { EnvironmentResource } from '@clerk/types';

export function useEnvironment() {
  const clerk = useClerk();
  return (clerk as any)?.__unstable__environment as EnvironmentResource;
}
