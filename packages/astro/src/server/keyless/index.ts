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
        async createAccountlessApplication(requestHeaders?: Headers) {
          try {
            return await clerkClient(context).__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers) {
          try {
            return await clerkClient(
              context,
            ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
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
