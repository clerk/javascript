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
        async createAccountlessApplication(requestHeaders?: Headers, source?: string) {
          try {
            return await clerkClient(event).__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
              source,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers, source?: string) {
          try {
            return await clerkClient(
              event,
            ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
              source,
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
