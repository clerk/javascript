import { createNodeFileStorage, type KeylessStorage } from '@clerk/shared/keyless';

export type { KeylessStorage };

export interface FileStorageOptions {
  cwd?: () => string;
}

/**
 * Creates a file-based storage adapter for keyless mode.
 * Uses dynamic imports to avoid breaking Cloudflare Workers.
 *
 * @throws {Error} If called in a non-Node.js environment
 */
export async function createFileStorage(options: FileStorageOptions = {}): Promise<KeylessStorage> {
  const { cwd = () => process.cwd() } = options;

  try {
    // Dynamic import to avoid bundler issues with edge runtimes
    const [fs, path] = await Promise.all([import('node:fs'), import('node:path')]);

    return createNodeFileStorage(fs, path, {
      cwd,
      frameworkPackageName: '@clerk/react-router',
    });
  } catch (error) {
    throw new Error(
      'Keyless mode requires a Node.js runtime with file system access. ' +
        'Set VITE_CLERK_KEYLESS_DISABLED=1 to disable keyless mode.',
    );
  }
}
