import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { describe, expect, test } from 'vitest';

const execFileAsync = promisify(execFile);

describe('notify', () => {
  test('generates changelog links for electron-passkeys platform packages', async () => {
    const releasedPackages = [
      { name: '@clerk/electron', version: '0.0.4' },
      { name: '@clerk/electron-passkeys-darwin-arm64', version: '0.0.3' },
    ];

    const { stdout } = await execFileAsync('node', [
      'scripts/notify.mjs',
      JSON.stringify(releasedPackages),
      'wobsoriano',
    ]);

    const payload = JSON.parse(stdout);
    const blocks = JSON.stringify(payload.blocks);

    expect(blocks).toContain('packages/electron/CHANGELOG.md#004');
    expect(blocks).toContain('packages/electron-passkeys/npm/darwin-arm64/CHANGELOG.md#003');
  });
});
