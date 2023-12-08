import { useAssertWrappedByClerkProvider as useSharedAssertWrappedByClerkProvider } from '@clerk/shared/react';

import { errorThrower } from '../utils';

export const useAssertWrappedByClerkProvider = (source: string): void => {
  useSharedAssertWrappedByClerkProvider(() => {
    errorThrower.throwMissingClerkProviderError({ source });
  });
};
