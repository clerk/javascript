import { createKeylessService } from '@clerk/shared/keyless';
import type { APIContext } from 'astro';

import { clerkClient } from '../clerk-client';
import { createFileStorage } from './file-storage.js';

// Lazily initialized keyless service singleton
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export function keyless(context: APIContext) {
  if (!keylessServiceInstance) {
    keylessServiceInstance = createKeylessService({
      storage: createFileStorage(),
      api: {
        async createAccountlessApplication(requestHeaders?: Headers, source?: string) {
          try {
            return await clerkClient(context).__experimental_accountlessApplications.createAccountlessApplication({
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
              context,
            ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
              source,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'astro',
    });
  }
  return keylessServiceInstance;
}
