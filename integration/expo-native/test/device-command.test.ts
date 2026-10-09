import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { deviceCommand, deviceToolCommand, type CommandRunner } from '../specs/support/device.ts';
import type { Device } from '../specs/support/inputs.ts';

describe('the device tool', () => {
  it('is adb on the device for shell and for reverse to a TCP port, and nothing that reaches the files or sockets of the machine adb runs on', () => {
    assert.deepEqual(deviceToolCommand('android', 'emulator-5560', ['shell', 'am force-stop com.x']), { command: 'adb', args: ['-s', 'emulator-5560', 'shell', 'am force-stop com.x'] });
    assert.deepEqual(deviceToolCommand('android', 'emulator-5560', ['reverse', 'tcp:8081', 'tcp:8081'], '/sdk/adb')?.command, '/sdk/adb');
    for (const args of [['reverse', '--list'], ['reverse', '--remove', 'tcp:8081'], ['reverse', '--no-rebind', 'tcp:8081', 'tcp:8081']]) assert.notEqual(deviceToolCommand('android', 'emulator-5560', args), null, args.join(' '));
    const refused = [['pull', '/sdcard/x', '/etc/x'], ['push', '/etc/passwd', '/sdcard/x'], ['emu', 'kill'], ['-s', 'other', 'shell'], [], ['reverse', 'tcp:9000', 'localfilesystem:/var/run/docker.sock'], ['reverse', 'tcp:9000', 'localabstract:x'], ['reverse', '--unknown']];
    for (const args of refused) assert.equal(deviceToolCommand('android', 'emulator-5560', args), null, args.join(' '));
    assert.equal(deviceToolCommand('ios', 'UDID', ['shell', 'id']), null);
  });
});

describe('deviceCommand', () => {
  it('runs adb from the SDK on this machine for a local device', async () => {
    const sdk = mkdtempSync(join(tmpdir(), 'verify-sdk-'));
    const ran: unknown[] = [];
    const device: Device = { kind: 'local', id: 'emulator-5560' };
    const runner: CommandRunner = async (command, args) => (ran.push([command, args]), { code: 0, stdout: 'ok', stderr: '' });
    const home = mkdtempSync(join(tmpdir(), 'verify-home-'));
    assert.deepEqual(await deviceCommand(device, 'android', ['shell', 'ls'], { runner, env: { ANDROID_HOME: sdk }, home }), { code: 0, stdout: 'ok', stderr: '' });
    assert.deepEqual(ran, [['adb', ['-s', 'emulator-5560', 'shell', 'ls']]], 'an SDK with no adb falls back to PATH');
    mkdirSync(join(sdk, 'platform-tools'));
    writeFileSync(join(sdk, 'platform-tools', 'adb'), '');
    await deviceCommand(device, 'android', ['shell', 'id'], { runner, env: { ANDROID_HOME: sdk }, home });
    assert.deepEqual(ran[1], [join(sdk, 'platform-tools', 'adb'), ['-s', 'emulator-5560', 'shell', 'id']]);
  });

  it('finds adb in the SDK that Android Studio installs when no variable names one', async () => {
    const home = mkdtempSync(join(tmpdir(), 'verify-home-'));
    const studioSdk = process.platform === 'darwin' ? join(home, 'Library', 'Android', 'sdk') : join(home, 'Android', 'Sdk');
    mkdirSync(join(studioSdk, 'platform-tools'), { recursive: true });
    writeFileSync(join(studioSdk, 'platform-tools', 'adb'), '');
    const ran: unknown[] = [];
    const device: Device = { kind: 'local', id: 'emulator-5560' };
    const runner: CommandRunner = async (command, args) => (ran.push([command, args]), { code: 0, stdout: '', stderr: '' });
    await deviceCommand(device, 'android', ['shell', 'id'], { runner, env: { ANDROID_HOME: '' }, home });
    assert.deepEqual(ran, [[join(studioSdk, 'platform-tools', 'adb'), ['-s', 'emulator-5560', 'shell', 'id']]]);
  });

  it('refuses arguments that are not a device command, before anything runs', async () => {
    const device: Device = { kind: 'local', id: 'emulator-5560' };
    await assert.rejects(deviceCommand(device, 'android', ['pull', '/sdcard/x', 'x'], { runner: async () => assert.fail('ran') }), /no android device command starts with pull/);
  });
});
