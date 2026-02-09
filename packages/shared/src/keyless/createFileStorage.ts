import * as fs from 'node:fs';
import * as path from 'node:path';

import { createNodeFileStorage } from './nodeFileStorage';
import type { KeylessStorage } from './service';

export interface FileStorageOptions {
  cwd?: () => string;
  frameworkPackageName: string;
}

/**
 * Creates a file-based storage adapter for keyless mode.
 * Uses Node.js filesystem modules - only call in Node.js runtimes.
 *
 * @param options - Configuration options including framework package name
 * @returns KeylessStorage implementation
 * @throws Error if filesystem modules are unavailable
 */
export function createFileStorage(options: FileStorageOptions): KeylessStorage {
  const { cwd = () => process.cwd(), frameworkPackageName } = options;

  try {
    return createNodeFileStorage(fs, path, {
      cwd,
      frameworkPackageName,
    });
  } catch {
    throw new Error(
      `Keyless mode requires a Node.js runtime with file system access. ` +
        `Set CLERK_KEYLESS_DISABLED=1 to disable keyless mode.`,
    );
  }
}
