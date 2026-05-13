import { createKeylessService } from '@clerk/shared/keyless';

import { clerkClient } from '../clerkClient';
import type { DataFunctionArgs } from '../loadOptions';
import type { ClerkMiddlewareOptions } from '../types';
import { createFileStorage } from './fileStorage';

// Lazily initialized keyless service singleton
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export function keyless(args: DataFunctionArgs, options?: ClerkMiddlewareOptions) {
  if (!keylessServiceInstance) {
    keylessServiceInstance = createKeylessService({
      storage: createFileStorage(),
      api: {
        async createAccountlessApplication(requestHeaders?: Headers) {
          try {
            return await clerkClient(args, options).__experimental_accountlessApplications.createAccountlessApplication(
              {
                requestHeaders,
              },
            );
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers) {
          try {
            return await clerkClient(
              args,
              options,
            ).__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'react-router',
    });
  }
  return keylessServiceInstance;
}
