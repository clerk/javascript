import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { startBroker } from '../src/core/broker.ts';
import { TEST_PHONES, createClerkBackends, type ClerkBackend } from '../src/core/clerk.ts';
import { Secret } from '../src/core/secret.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import type { PublishableKey, TestPhone } from '../src/core/types.ts';

describe('broker', () => {
  it('reserves a test phone that no user holds and nothing else in the run was given, and ledgers it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-broker-'));
    const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
    const { run, scratch } = workspace.newRun();
    const free = TEST_PHONES.slice(40, 43);
    const held = new Set<string>(TEST_PHONES.filter((phone) => !free.includes(phone)));
    const bapi = (async (url: string | URL, init?: RequestInit) => {
      const asked = new URL(String(url)).searchParams.get('phone_number');
      if (asked !== null) return new Response(JSON.stringify(held.has(asked) ? [{ id: 'user_0' }] : []), { status: 200 });
      const [phone] = (JSON.parse(String(init?.body)) as { phone_number?: string[] }).phone_number ?? [];
      if (phone !== undefined && held.has(phone)) return new Response(JSON.stringify({ errors: [{ code: 'form_identifier_exists' }] }), { status: 422 });
      if (phone !== undefined) held.add(phone);
      return new Response(JSON.stringify({ id: `user_${held.size}` }), { status: 200 });
    }) as typeof fetch;
    const keys = { pk: 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_x') };
    const clerk = createClerkBackends(bapi)(() => keys);
    const deps = { clerk: () => clerk, publishableKey: () => keys.pk, platforms: ['ios' as const] };
    const post = async (broker: { url: string; tokenFile: string }, path: string, body: unknown = {}) => {
      const response = await fetch(`${broker.url}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${readFileSync(broker.tokenFile, 'utf8')}` }, body: JSON.stringify(body) });
      return { status: response.status, json: (await response.json()) as { phone?: TestPhone; code?: string } };
    };
    const first = await startBroker(run, workspace, scratch, deps);
    let reserved: TestPhone;
    try {
      const answer = await post(first, '/reservePhone');
      assert.equal(answer.status, 200);
      reserved = answer.json.phone!;
      assert.ok(free.includes(reserved), `${reserved} is not one of the three numbers no user holds`);
    } finally {
      await first.stop();
    }
    const second = await startBroker(run, workspace, scratch, deps);
    let again: TestPhone;
    try {
      again = (await post(second, '/reservePhone')).json.phone!;
      assert.ok(free.includes(again) && again !== reserved, 'a broker started later in the run does not hand out the same number');
      const seeded = (await post(second, '/seedUser', { phone: true })).json.phone!;
      assert.deepEqual([reserved, again, seeded].sort(), [...free].sort(), 'a seeded user gets the one number that is neither held nor reserved');
      const none = await post(second, '/reservePhone');
      assert.deepEqual([none.status, none.json.code], [400, 'INSTANCE_MISCONFIGURED']);
    } finally {
      await second.stop();
    }
    assert.deepEqual(workspace.unclosedEntries().flatMap((entry) => (entry.kind === 'phone' ? [[entry.run, entry.phone]] : [])), [[run, reserved], [run, again]]);
  });

  it('launches only on the platform this run drives', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-broker-'));
    const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
    const { run, scratch } = workspace.newRun();
    const broker = await startBroker(run, workspace, scratch, {
      clerk: () => ({}) as ClerkBackend,
      publishableKey: () => 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey,
      platforms: ['ios'],
    });
    const launch = (platform: string) =>
      fetch(`${broker.url}/launch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${readFileSync(broker.tokenFile, 'utf8')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, user: null, authMode: 'signUp', initialIdentifier: null, debugLogs: false, storageScope: null }),
      });
    try {
      const ios = await launch('ios');
      assert.equal(ios.status, 200);
      const { launchArguments } = (await ios.json()) as { launchArguments: string[] };
      assert.deepEqual(
        launchArguments.filter((_, index) => index % 2 === 0),
        ['-verifyPublishableKey', '-verifyRunId', '-verifyStorageScope', '-verifyLaunchId', '-verifyAuthMode'],
        'a request names an auth mode',
      );
      const android = await launch('android');
      assert.equal(android.status, 400);
      assert.equal(((await android.json()) as { code: string }).code, 'USAGE');
    } finally {
      await broker.stop();
    }
  });

  it('hands the app the initial identifier a launch names, and none when a launch names none', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-broker-'));
    const workspace = openWorkspace({ skillDir: dir, worktree: dir, home: join(dir, 'home') });
    const { run, scratch } = workspace.newRun();
    const broker = await startBroker(run, workspace, scratch, {
      clerk: () => ({}) as ClerkBackend,
      publishableKey: () => 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk' as PublishableKey,
      platforms: ['android'],
    });
    const launched = async (initialIdentifier: string | null): Promise<readonly string[]> => {
      const response = await fetch(`${broker.url}/launch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${readFileSync(broker.tokenFile, 'utf8')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'android', user: null, authMode: null, initialIdentifier, debugLogs: false, storageScope: null }),
      });
      assert.equal(response.status, 200);
      return ((await response.json()) as { launchArguments: string[] }).launchArguments;
    };
    try {
      assert.deepEqual((await launched('+12015550100')).slice(-3), ['--es', 'verifyInitialIdentifier', '+12015550100']);
      assert.equal((await launched(null)).includes('verifyInitialIdentifier'), false);
    } finally {
      await broker.stop();
    }
  });
});
