import type { EnvironmentResource } from '@clerk/types';

import { useEnvironmentContext } from '../contexts/EnvironmentContext';

type UseEnvironmentReturn =
  | { isLoaded: false; environment: undefined }
  | { isLoaded: true; environment: null }
  | { isLoaded: true; environment: EnvironmentResource };

// TODO: Add comments with examples
export function useEnvironment(): UseEnvironmentReturn {
  const environment = useEnvironmentContext();

  if (environment === undefined) {
    return { isLoaded: false, environment: undefined };
  }

  if (environment === null) {
    return { isLoaded: true, environment: null };
  }

  return { isLoaded: true, environment };
}
