import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { run, type ExecResult, type Runner } from './exec.ts';
import type { Lease } from './types.ts';

function localAdb(env: Readonly<Record<string, string | undefined>>): string {
  const root = env.ANDROID_HOME ?? env.ANDROID_SDK_ROOT;
  const inSdk = root === undefined ? '' : join(root, 'platform-tools', 'adb');
  return inSdk !== '' && existsSync(inSdk) ? inSdk : 'adb';
}

export async function deviceCommand(lease: Lease, args: readonly string[], options: { readonly runner?: Runner; readonly env?: Readonly<Record<string, string | undefined>> } = {}): Promise<ExecResult> {
  return (options.runner ?? run)(localAdb(options.env ?? process.env), ['-s', lease.deviceId, ...args]);
}
