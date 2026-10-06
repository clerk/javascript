import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { deviceCommand } from '../src/core/device-command.ts';
import { run } from '../src/core/exec.ts';
import type { LocalLease } from '../src/core/types.ts';

describe('deviceCommand', () => {
  it('runs adb from the SDK on this machine for a local lease', async () => {
    const sdk = mkdtempSync(join(tmpdir(), 'verify-sdk-'));
    const ran: unknown[] = [];
    const lease = { backend: 'local', platform: 'android', deviceId: 'emulator-5560' } as LocalLease;
    const runner: typeof run = async (command, args) => (ran.push([command, args]), { code: 0, stdout: 'ok', stderr: '' });
    assert.deepEqual(await deviceCommand(lease, ['shell', 'ls'], { runner, env: { ANDROID_HOME: sdk } }), { code: 0, stdout: 'ok', stderr: '' });
    assert.deepEqual(ran, [['adb', ['-s', 'emulator-5560', 'shell', 'ls']]], 'an SDK with no adb falls back to PATH');
    mkdirSync(join(sdk, 'platform-tools'));
    writeFileSync(join(sdk, 'platform-tools', 'adb'), '');
    await deviceCommand(lease, ['shell', 'id'], { runner, env: { ANDROID_HOME: sdk } });
    assert.deepEqual(ran[1], [join(sdk, 'platform-tools', 'adb'), ['-s', 'emulator-5560', 'shell', 'id']]);
  });
});
