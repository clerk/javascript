import * as fs from 'node:fs';
import * as path from 'node:path';

import { createNodeFileStorage, type KeylessStorage } from '@clerk/shared/keyless';

export type { KeylessStorage };

export interface FileStorageOptions {
  cwd?: () => string;
}

export function createFileStorage(options: FileStorageOptions = {}): KeylessStorage {
  const { cwd = () => process.cwd() } = options;

  return createNodeFileStorage(fs, path, {
    cwd,
    frameworkPackageName: '@clerk/react-router',
  });
}
