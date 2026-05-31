import { mkdtemp, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createCredentialStore } from '../lib/credential-store';

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await mkdtemp(join(process.cwd(), '.tmp-credential-store-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});

describe('credential store', () => {
  it('round-trips values in memory', async () => {
    const store = createCredentialStore('memory');

    await store.set('tokens', 'value');
    await expect(store.get('tokens')).resolves.toBe('value');

    await store.delete('tokens');
    await expect(store.get('tokens')).resolves.toBeNull();
  });

  it('creates a chmod 600 JSON file', async () => {
    const dir = await makeTempDir();
    const filePath = join(dir, 'credentials.json');
    const store = createCredentialStore('file', { filePath });

    await store.set('tokens', 'secret');

    await expect(store.get('tokens')).resolves.toBe('secret');
    const mode = (await stat(filePath)).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('serializes concurrent file writes and reads', async () => {
    const dir = await makeTempDir();
    const filePath = join(dir, 'credentials.json');
    const store = createCredentialStore('file', { filePath });
    const entries: Array<[string, string]> = Array.from({ length: 20 }, (_, index) => [
      `key-${index}`,
      `value-${index}`,
    ]);

    await Promise.all(entries.map(([key, value]) => store.set(key, value)));

    const values = await Promise.all(entries.map(([key]) => store.get(key)));
    expect(values).toEqual(entries.map(([, value]) => value));
  });
});
