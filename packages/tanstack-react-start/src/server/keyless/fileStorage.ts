import { createFileStorage as sharedCreateFileStorage } from '@clerk/shared/keyless';
export type { KeylessStorage } from '@clerk/shared/keyless';

/**
 * Creates a file-based storage adapter for keyless mode.
 */
export function createFileStorage() {
  return sharedCreateFileStorage({
    frameworkPackageName: '@clerk/tanstack-react-start',
  });
}
