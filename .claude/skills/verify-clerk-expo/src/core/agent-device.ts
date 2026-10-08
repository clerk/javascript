import type { Lease } from './types.ts';

export function agentDeviceFor(lease: Lease): { readonly selector: readonly string[]; readonly env: Readonly<Record<string, string>> } {
  const device = ['--platform', lease.platform, lease.platform === 'ios' ? '--udid' : '--serial', lease.deviceId];
  return { selector: device, env: {} };
}
