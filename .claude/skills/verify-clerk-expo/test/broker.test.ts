import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { startBroker } from '../src/core/broker.ts';
import type { ClerkBackend } from '../src/core/clerk.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import type { PublishableKey } from '../src/core/types.ts';

describe('broker', () => {
  it('launches only on the platform this run drives', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-broker-'));
    const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
    const { run, scratch } = workspace.newRun();
    const broker = await startBroker(run, workspace, scratch, {
      clerk: () => ({}) as ClerkBackend,
      publishableKey: () => 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey,
      screens: ['home', 'auth'],
      platforms: ['ios'],
    });
    const launch = (platform: string) =>
      fetch(`${broker.url}/launch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${readFileSync(broker.tokenFile, 'utf8')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, user: null, screen: 'auth', authMode: null, debugLogs: false, storageScope: null }),
      });
    try {
      const ios = await launch('ios');
      assert.equal(ios.status, 200);
      assert.ok(((await ios.json()) as { launchArguments: string[] }).launchArguments.includes('-verifyScreen'));
      const android = await launch('android');
      assert.equal(android.status, 400);
      assert.equal(((await android.json()) as { code: string }).code, 'USAGE');
    } finally {
      await broker.stop();
    }
  });
});
