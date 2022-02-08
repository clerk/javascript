import { LoadedClerk } from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

export const useClerk = (): LoadedClerk => {
  const isomorphicClerk = useIsomorphicClerkContext();
  // The actual value is an instance of IsomorphicClerk, not Clerk
  // we expose is as a Clerk instance
  return isomorphicClerk as unknown as LoadedClerk;
};
