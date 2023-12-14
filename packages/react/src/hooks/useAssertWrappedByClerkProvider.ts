import { useAssertWrappedByClerkProvider as useSharedAssertWrappedByClerkProvider } from '@clerk/shared/react';

import { errorThrower } from '../errors/errorThrower';

export const useAssertWrappedByClerkProvider = (source: string): void => {
  useSharedAssertWrappedByClerkProvider(() => {
    errorThrower.throwMissingClerkProviderError({ source });
  });
};
