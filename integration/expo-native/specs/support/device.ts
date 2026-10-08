import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Device } from './inputs.ts';
import { Secret } from './secret.ts';
import type { Platform } from './types.ts';

export interface CommandLine {
  readonly command: string;
  readonly args: readonly string[];
}

export interface CommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

export type CommandRunner = (command: string, args: readonly string[]) => Promise<CommandResult>;

export function agentDevice(device: Device, platform: Platform): { readonly selector: readonly string[]; readonly env: Readonly<Record<string, string>> } {
  const selector = ['--platform', platform, platform === 'ios' ? '--udid' : '--serial', device.id];
  if (device.kind === 'local') return { selector, env: {} };
  const token = new Secret('session-bearer', readFileSync(device.tokenFile, 'utf8').trim());
  return {
    selector: [...selector, '--daemon-base-url', device.daemonUrl],
    env: token.use('agent-device-daemon', (plain) => ({ AGENT_DEVICE_DAEMON_AUTH_TOKEN: plain })),
  };
}

const REVERSE_FLAGS: ReadonlySet<string> = new Set(['--list', '--no-rebind', '--remove', '--remove-all']);

export function deviceToolCommand(platform: Platform, deviceId: string, args: readonly string[], adb = 'adb'): CommandLine | null {
  if (platform !== 'android') return null;
  const [subcommand, ...rest] = args;
  const allowed = subcommand === 'shell' || (subcommand === 'reverse' && rest.every((arg) => REVERSE_FLAGS.has(arg) || /^tcp:\d{1,5}$/.test(arg)));
  return allowed ? { command: adb, args: ['-s', deviceId, ...args] } : null;
}

function localAdb(env: Readonly<Record<string, string | undefined>>, home: string): string {
  const byDefault = process.platform === 'darwin' ? join(home, 'Library', 'Android', 'sdk') : join(home, 'Android', 'Sdk');
  const roots = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT, byDefault].filter((root): root is string => root !== undefined && root !== '');
  return roots.map((root) => join(root, 'platform-tools', 'adb')).find((adb) => existsSync(adb)) ?? 'adb';
}

const run: CommandRunner = (command, args) =>
  new Promise((resolve) => {
    execFile(command, [...args], (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else resolve(typeof error.code === 'number' ? { code: error.code, stdout, stderr } : { code: 127, stdout, stderr: stderr + error.message });
    });
  });

export async function deviceCommand(
  device: Device,
  platform: Platform,
  args: readonly string[],
  options: { readonly runner?: CommandRunner; readonly env?: Readonly<Record<string, string | undefined>>; readonly home?: string } = {},
): Promise<CommandResult> {
  const local = deviceToolCommand(platform, device.id, args, localAdb(options.env ?? process.env, options.home ?? homedir()));
  if (local === null) throw new Error(`no ${platform} device command starts with ${args[0] ?? 'nothing'}; on Android use adb shell or adb reverse arguments, and on iOS pass what the app needs as launch arguments`);
  return (options.runner ?? run)(local.command, local.args);
}
