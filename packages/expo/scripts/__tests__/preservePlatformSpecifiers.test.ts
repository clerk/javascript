import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

import { preservePlatformSpecifiers } from '../preservePlatformSpecifiers.mts';

describe('preservePlatformSpecifiers', () => {
  let tmpDir: string | undefined;

  afterEach(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  function createFile(relativePath: string) {
    if (!tmpDir) {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-platform-specifiers-'));
    }

    const filePath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '');

    return filePath;
  }

  test('preserves extensionless relative specifiers when the resolved file has platform siblings', async () => {
    const importer = createFile('src/index.ts');
    const resolvedId = createFile('src/foo.ts');
    createFile('src/foo.ios.ts');
    const plugin = preservePlatformSpecifiers();

    const result = await (plugin.resolveId as Function).call(
      {
        resolve: async (source: string, importerId: string, options: { skipSelf?: boolean }) => {
          expect(source).toBe('./foo');
          expect(importerId).toBe(importer);
          expect(options.skipSelf).toBe(true);

          return { id: resolvedId };
        },
      },
      './foo',
      importer,
      {},
    );

    expect(result).toEqual({ id: './foo', external: true });
  });

  test('does not preserve relative specifiers without platform siblings', async () => {
    const importer = createFile('src/index.ts');
    const resolvedId = createFile('src/foo.ts');
    const plugin = preservePlatformSpecifiers();

    const result = await (plugin.resolveId as Function).call(
      {
        resolve: async () => ({ id: resolvedId }),
      },
      './foo',
      importer,
      {},
    );

    expect(result).toBeNull();
  });

  test('does not preserve explicitly platform-suffixed specifiers', async () => {
    const importer = createFile('src/index.ts');
    createFile('src/foo.ios.ts');
    const plugin = preservePlatformSpecifiers();

    const result = await (plugin.resolveId as Function).call(
      {
        resolve: async () => {
          throw new Error('explicit platform specifiers should not be resolved');
        },
      },
      './foo.ios',
      importer,
      {},
    );

    expect(result).toBeNull();
  });

  test('does not preserve explicitly extensioned specifiers', async () => {
    const importer = createFile('src/index.ts');
    createFile('src/foo.ts');
    createFile('src/foo.ios.ts');
    const plugin = preservePlatformSpecifiers();

    const result = await (plugin.resolveId as Function).call(
      {
        resolve: async () => {
          throw new Error('explicitly extensioned specifiers should not be resolved');
        },
      },
      './foo.ts',
      importer,
      {},
    );

    expect(result).toBeNull();
  });
});
