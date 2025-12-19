import { createKeylessService } from '@clerk/shared/keyless';

import { clerkClient } from '../clerkClient';
import { createFileStorage } from './fileStorage';

// Create a singleton keyless service for TanStack Start
export const keyless = createKeylessService({
  storage: createFileStorage(),
  api: {
    createAccountlessApplication: async (requestHeaders?: Headers) => {
      return await clerkClient().__experimental_accountlessApplications.createAccountlessApplication({
        requestHeaders,
      });
    },
    completeOnboarding: async (requestHeaders?: Headers) => {
      return await clerkClient().__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
        requestHeaders,
      });
    },
  },
  framework: 'tanstack-react-start',
});
