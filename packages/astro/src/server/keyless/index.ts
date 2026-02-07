import { createKeylessService } from '@clerk/shared/keyless';
import type { APIContext } from 'astro';

import { clerkClient } from '../clerk-client';
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
            const mockContext = {
              locals: { runtime: { env: {} } },
            } as unknown as APIContext;

            return await clerkClient(mockContext).__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers) {
          try {
            const mockContext = {
              locals: { runtime: { env: {} } },
            } as unknown as APIContext;

            return await clerkClient(
              mockContext,
            ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
      },
      framework: '@clerk/astro',
      frameworkVersion: PACKAGE_VERSION,
    });
  }

  return keylessServiceInstance;
}
