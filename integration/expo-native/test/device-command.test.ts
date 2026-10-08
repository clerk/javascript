import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { deviceCommand, deviceToolCommand, type CommandRunner } from '../specs/support/device.ts';
import type { Device } from '../specs/support/inputs.ts';
import { run } from '../src/core/exec.ts';
import { coreVersion } from '../src/core/manifest.ts';
import { remoteBackend } from '../src/core/remote/backend.ts';
import type { GitHub } from '../src/core/remote/github.ts';
import type { SessionHealth } from '../src/core/remote/protocol.ts';
import { VerifyFailure, type RemoteLease } from '../src/core/types.ts';

const realFetch = globalThis.fetch;
afterEach(() => void (globalThis.fetch = realFetch));

function remoteLease(platform: 'ios' | 'android'): RemoteLease {
  const tokenFile = join(mkdtempSync(join(tmpdir(), 'verify-command-')), 'token');
  writeFileSync(tokenFile, 'd'.repeat(64));
  return { backend: 'remote', provider: 'github-actions', platform, session: `${platform}abc123`, providerRef: '7', baseUrl: 'https://quick-fox.trycloudflare.com', tokenFile, deviceId: 'emulator-5554', deviceName: 'Pixel', runner: 'linux', expiresAt: new Date(Date.now() + 3_600_000).toISOString(), builtSha: null, acquiredAt: '', installedBuild: null };
}

function tunnel(reply: (path: string) => { status: number; body: unknown }): { readonly calls: { path: string; method: string; authorization: string | null; body: unknown }[] } {
  const calls: { path: string; method: string; authorization: string | null; body: unknown }[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    assert.equal(url.host, 'quick-fox.trycloudflare.com');
    calls.push({ path: url.pathname, method: init?.method ?? 'GET', authorization: new Headers(init?.headers).get('authorization'), body: typeof init?.body === 'string' ? JSON.parse(init.body) : null });
    const { status, body } = reply(url.pathname);
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  return { calls };
}

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

describe('a session started from another core', () => {
  const health = (core: string | undefined): SessionHealth =>
    ({ core, device: { id: 'emulator-5554', name: 'Pixel', ready: true }, daemon: true, build: { state: 'none' }, capAt: '', ending: null }) as SessionHealth;
  const backend = () =>
    remoteBackend(
      { platform: 'android', repo: 'clerk/clerk-android', workflow: 'verify-remote.yml', sessionsDir: mkdtempSync(join(tmpdir(), 'verify-core-')), runner: 'linux', plumbingRunner: 'ubuntu-latest', device: 'Pixel', idleMinutes: 15, capMinutes: 60, requirement: '' },
      { env: {}, runner: run, github: async () => assert.fail('a session that answers is not looked up at GitHub') },
    );

  it('is held when its agent has this checkout\'s core', async () => {
    tunnel(() => ({ status: 200, body: health(coreVersion()) }));
    assert.equal(await backend().check(remoteLease('android')), 'held');
  });

  it('is refused, not renewed, when its agent has another core, with the fix that gets both onto one commit', async () => {
    for (const core of ['0123456789ab', undefined]) {
      tunnel(() => ({ status: 200, body: health(core) }));
      await assert.rejects(backend().check(remoteLease('android')), (error: VerifyFailure) => error.code === 'NOT_READY' && error.message.includes(coreVersion()) && error.fix === 'commit and push the changes to the files MANIFEST lists, then {cli} down and {cli} up');
    }
  });
});

describe('acquiring a session whose agent has another core', () => {
  it('asks that session to stop through its tunnel and keeps no lease or token', async () => {
    const sessionsDir = mkdtempSync(join(tmpdir(), 'verify-acquire-'));
    const tunnelCalls: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input));
      tunnelCalls.push(`${init?.method ?? 'GET'} ${url.host}${url.pathname}`);
      const body = url.pathname === '/__sim/stop' ? { ok: true } : ({ core: '0123456789ab', device: { id: 'emulator-5560', name: 'Pixel', ready: false }, daemon: false, build: { state: 'none' }, capAt: '', ending: null } satisfies SessionHealth);
      return new Response(JSON.stringify(body), { status: 200 });
    }) as typeof fetch;
    const hubCalls: string[] = [];
    const hub: GitHub = {
      repo: 'clerk/clerk-android',
      workflow: 'verify-remote.yml',
      tokenSource: 'none',
      async api(method, path) {
        hubCalls.push(`${method} ${path}`);
        if (path.endsWith('/dispatches')) return { status: 200, json: { workflow_run_id: 9 }, headers: new Headers() };
        if (path.includes('/jobs')) return { status: 200, json: { jobs: [{ name: 'session', status: 'in_progress', conclusion: null, steps: [{ name: 'verify-remote tunnel quick-fox.trycloudflare.com', status: 'completed', conclusion: 'success' }] }] }, headers: new Headers() };
        const stopped = tunnelCalls.some((call) => call.endsWith('/__sim/stop'));
        return { status: 200, json: { status: stopped ? 'completed' : 'in_progress', conclusion: stopped ? 'success' : null, html_url: 'https://github.com/x' }, headers: new Headers() };
      },
    };
    const backend = remoteBackend(
      { platform: 'android', repo: 'clerk/clerk-android', workflow: 'verify-remote.yml', sessionsDir, runner: 'linux', plumbingRunner: 'ubuntu-latest', device: 'Pixel', idleMinutes: 15, capMinutes: 60, requirement: '' },
      { env: {}, runner: async () => ({ code: 0, stdout: 'my-branch\n', stderr: '' }), github: async () => hub },
    );
    const progress: string[] = [];
    await assert.rejects(
      backend.acquire({ platform: 'android', worktree: '/w', waitSeconds: 0, app: { sourceSha: 'f'.repeat(40) } as never, retryWith: '', progress: (line) => progress.push(line) }),
      (error: VerifyFailure) => error.code === 'NOT_READY' && error.message.includes('0123456789ab') && error.fix.includes('{cli} down and {cli} up'),
    );
    assert.deepEqual(tunnelCalls, ['GET quick-fox.trycloudflare.com/__sim/health', 'POST quick-fox.trycloudflare.com/__sim/stop']);
    assert.equal(hubCalls.some((call) => call.endsWith('/cancel')), false, 'a session that stops when asked is not cancelled');
    assert.deepEqual(readdirSync(sessionsDir), ['owner'], 'the token of the session that was ended is gone');
  });
});
