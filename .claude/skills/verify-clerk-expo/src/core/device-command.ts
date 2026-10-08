import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { run, type CommandLine, type ExecResult, type Runner } from './exec.ts';
import { VerifyFailure, type Lease, type Platform } from './types.ts';

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

export async function deviceCommand(
  lease: Lease,
  args: readonly string[],
  options: { readonly runner?: Runner; readonly env?: Readonly<Record<string, string | undefined>>; readonly home?: string } = {},
): Promise<ExecResult> {
  const local = deviceToolCommand(lease.platform, lease.deviceId, args, localAdb(options.env ?? process.env, options.home ?? homedir()));
  if (local === null) throw new VerifyFailure('UNSUPPORTED', `no ${lease.platform} device command starts with ${args[0] ?? 'nothing'}`, 'on Android use adb shell or adb reverse arguments; on iOS pass what the app needs as launch arguments');
  return (options.runner ?? run)(local.command, local.args);
}
