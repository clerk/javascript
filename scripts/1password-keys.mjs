#!/usr/bin/env node

import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { $ } from 'zx';

const is1PasswordInstalled = await $`op --version`.then(res => res.exitCode === 0).catch(() => false);

if (!is1PasswordInstalled) {
  console.error('1Password CLI is not installed. Install it with `brew install 1password-cli`.');
  process.exit(1);
}

const envItem = await $`op read 'op://Shared/JS SDKs integration tests/add more/.env.local'`
  .then(res => {
    if (res.exitCode === 0) {
      return res.stdout;
    }

    return null;
  })
  .catch(() => {
    return null;
  });

const keysItem = await $`op read 'op://Shared/JS SDKs integration tests/add more/.keys.json'`
  .then(res => {
    if (res.exitCode === 0) {
      return res.stdout;
    }

    return null;
  })
  .catch(() => {
    return null;
  });

if (!envItem || !keysItem) {
  console.error(
    'Failed to read from 1Password. Have you enabled the 1Password CLI in your 1Password settings? See https://developer.1password.com/docs/cli/get-started/#step-2-turn-on-the-1password-desktop-app-integration for more information.',
  );
  process.exit(1);
}

await writeFile(join(process.cwd(), 'integration', '.env.local'), envItem);
await writeFile(join(process.cwd(), 'integration', '.keys.json'), keysItem);

// Fetch staging keys (optional — won't fail if the field doesn't exist)
const stagingKeysItem = await $`op read 'op://Shared/JS SDKs integration tests/add more/.keys.staging.json'`
  .then(res => {
    if (res.exitCode === 0) {
      return res.stdout;
    }

    return null;
  })
  .catch(() => {
    return null;
  });

if (stagingKeysItem) {
  await writeFile(join(process.cwd(), 'integration', '.keys.staging.json'), stagingKeysItem);
  console.log('Keys and env written to .keys.json, .keys.staging.json, and .env.local');
} else {
  await rm(join(process.cwd(), 'integration', '.keys.staging.json'), { force: true });
  console.log('Keys and env written to .keys.json and .env.local (staging keys not found, skipping)');
}
