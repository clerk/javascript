import { createKeylessService } from '@clerk/shared/keyless';

import { clerkClient } from '../clerkClient';
import { createFileStorage } from './fileStorage';

// Lazily initialized keyless service singleton
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export function keyless() {
  if (!keylessServiceInstance) {
    keylessServiceInstance = createKeylessService({
      storage: createFileStorage(),
      api: {
        async createAccountlessApplication(requestHeaders?: Headers, source?: string) {
          try {
            return await clerkClient().__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
              source,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers, source?: string) {
          try {
            return await clerkClient().__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
              source,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'tanstack-react-start',
    });
  }
  return keylessServiceInstance;
}
