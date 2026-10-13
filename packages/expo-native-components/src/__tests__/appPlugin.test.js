import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const { withClerkExpoNativeComponents } = require('../../app.plugin.js')._testing;

const applyMod = (config, platform, mod, modResults) =>
  config.mods[platform][mod]({ ...config, modRequest: {}, modResults });

describe('withClerkExpoNativeComponents', () => {
  let clerkExpoDir;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    clerkExpoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clerk-expo-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(clerkExpoDir, { recursive: true, force: true });
  });

  test('reports the installed @clerk/expo version on iOS and Android', async () => {
    const config = withClerkExpoNativeComponents({ name: 'test', slug: 'test' }, {}, () => ({
      dir: clerkExpoDir,
      version: '4.8.0',
    }));

    const infoPlist = await applyMod(config, 'ios', 'infoPlist', {});
    const gradleProperties = await applyMod(config, 'android', 'gradleProperties', [
      { type: 'property', key: 'clerkExpo.hostSdkVersion', value: '4.7.0' },
    ]);

    expect(infoPlist.modResults.ClerkExpoVersion).toBe('4.8.0');
    expect(gradleProperties.modResults).toEqual([
      { type: 'property', key: 'clerkExpo.hostSdkVersion', value: '4.8.0' },
    ]);
  });

  test('throws when the installed @clerk/expo still bundles the native module', () => {
    fs.writeFileSync(path.join(clerkExpoDir, 'expo-module.config.json'), '{}');

    expect(() =>
      withClerkExpoNativeComponents({ name: 'test', slug: 'test' }, {}, () => ({
        dir: clerkExpoDir,
        version: '4.7.1',
      })),
    ).toThrow('@clerk/expo@4.7.1 still bundles the Clerk native module');
  });
});
