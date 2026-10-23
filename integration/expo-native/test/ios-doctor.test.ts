import '@clerk/internal-mobile-e2e/testing/git-env';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { localIosBackend } from '../src/platform/ios/local.ts';

describe('iOS doctor', () => {
  it('reports the missing Xcode rather than failing when xcrun simctl cannot run', async () => {
    const bin = mkdtempSync(join(tmpdir(), 'verify-no-xcode-'));
    for (const tool of ['xcodebuild', 'xcrun', 'scutil']) {
      writeFileSync(join(bin, tool), '#!/bin/sh\necho "xcode-select: error: tool requires Xcode" >&2\nexit 1\n');
      chmodSync(join(bin, tool), 0o755);
    }
    const path = process.env.PATH;
    process.env.PATH = bin;
    try {
      const { toolchain, device } = await localIosBackend({ os: 'darwin' }).doctorChecks({ live: false, worktree: '/nowhere', progress: () => undefined });
      assert.deepEqual(toolchain.map(({ id, ok }) => ({ id, ok })), [{ id: 'xcode', ok: false }]);
      assert.deepEqual(device.find((check) => check.id === 'lane-ports'), { id: 'lane-ports', ok: true, state: 'not-run', detail: 'not run: needs xcode' });
    } finally {
      process.env.PATH = path;
    }
  });
});
