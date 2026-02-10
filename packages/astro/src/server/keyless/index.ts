import { createClerkClient } from '@clerk/backend';
import { createKeylessService } from '@clerk/shared/keyless';

import { createFileStorage } from './file-storage.js';

let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export async function keyless() {
  if (!keylessServiceInstance) {
    const storage = await createFileStorage();

    keylessServiceInstance = createKeylessService({
      storage,
      api: {
        async createAccountlessApplication(requestHeaders?: Headers) {
          try {
            const client = createClerkClient({
              secretKey: process.env.CLERK_SECRET_KEY,
              publishableKey: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
              apiUrl: process.env.CLERK_API_URL,
            });
            return await client.__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers) {
          try {
            const client = createClerkClient({
              secretKey: process.env.CLERK_SECRET_KEY,
              publishableKey: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
              apiUrl: process.env.CLERK_API_URL,
            });
            return await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'astro',
      frameworkVersion: PACKAGE_VERSION,
    });
  }

  return keylessServiceInstance;
}
