import type { LoadedClerk } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';

export const useClerk = (): LoadedClerk => {
  useAssertWrappedByClerkProvider('useClerk');
  return useClerkInstanceContext();
};
