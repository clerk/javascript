import { createKeylessService, createNodeFileStorage } from '@clerk/shared/keyless';

import { createClerkClientWithOptions } from './createClerkClient';
import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

function createFileStorage() {
  const fs = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  return createNodeFileStorage(fs, path, {
    cwd,
    frameworkPackageName: '@clerk/nextjs',
  });
}

// Lazily initialized keyless service singleton
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export function keyless() {
  if (!keylessServiceInstance) {
    const client = createClerkClientWithOptions({});

    keylessServiceInstance = createKeylessService({
      storage: createFileStorage(),
      api: {
        async createAccountlessApplication(requestHeaders?: Headers, source?: string) {
          try {
            return await client.__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
              source,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers, source?: string) {
          try {
            return await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
              source,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'nextjs',
    });
  }
  return keylessServiceInstance;
}
