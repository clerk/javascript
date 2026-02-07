import type { KeylessStorage } from '@clerk/shared/keyless';

export type { KeylessStorage };

export interface FileStorageOptions {
  cwd?: () => string;
}

export async function createFileStorage(options: FileStorageOptions = {}): Promise<KeylessStorage> {
  const { cwd = () => process.cwd() } = options;

  const [{ default: fs }, { default: path }] = await Promise.all([import('node:fs'), import('node:path')]);

  const { createNodeFileStorage } = await import('@clerk/shared/keyless');

  return createNodeFileStorage(fs, path, {
    cwd,
    frameworkPackageName: '@clerk/astro',
  });
}
