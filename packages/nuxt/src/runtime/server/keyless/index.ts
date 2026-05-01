import { createKeylessService } from '@clerk/shared/keyless';
import type { H3Event } from 'h3';

import { clerkClient } from '../clerkClient';
import { createFileStorage } from './fileStorage';

// Lazily initialized keyless service singleton
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export function keyless(event: H3Event) {
  if (!keylessServiceInstance) {
    keylessServiceInstance = createKeylessService({
      storage: createFileStorage(),
      api: {
        async createAccountlessApplication(requestHeaders?: Headers) {
          try {
            return await clerkClient(event).__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers) {
          try {
            return await clerkClient(
              event,
            ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'nuxt',
    });
  }
  return keylessServiceInstance;
}
