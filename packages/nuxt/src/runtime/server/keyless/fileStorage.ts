import { createNodeFileStorage, type KeylessStorage } from '@clerk/shared/keyless';

export type { KeylessStorage };

export interface FileStorageOptions {
  cwd?: () => string;
}

/**
 * Creates a file-based storage adapter for keyless mode.
 * Uses dynamic imports to avoid bundler issues with edge runtimes.
 */
export async function createFileStorage(options: FileStorageOptions = {}): Promise<KeylessStorage> {
  const { cwd = () => process.cwd() } = options;

  try {
    const [fs, path] = await Promise.all([import('node:fs'), import('node:path')]);

    return createNodeFileStorage(fs, path, {
      cwd,
      frameworkPackageName: '@clerk/nuxt',
    });
  } catch {
    throw new Error(
      'Keyless mode requires a Node.js runtime with file system access. ' +
        'Set NUXT_PUBLIC_CLERK_KEYLESS_DISABLED=1 or CLERK_KEYLESS_DISABLED=1 to disable keyless mode.',
    );
  }
}
