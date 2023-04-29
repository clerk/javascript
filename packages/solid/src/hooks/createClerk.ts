import type { LoadedClerk } from '@clerk/types';
import type { Accessor } from 'solid-js';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

export const createClerk = (): Accessor<LoadedClerk> => {
  const isomorphicClerk = useIsomorphicClerkContext();
  // The actual value is an instance of IsomorphicClerk, not Clerk
  // we expose is as a Clerk instance
  return isomorphicClerk as unknown as Accessor<LoadedClerk>;
};
