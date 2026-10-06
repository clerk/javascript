import type { Lease } from './types.ts';

export function agentDeviceFor(lease: Lease): { readonly selector: readonly string[] } {
  const device = ['--platform', lease.platform, lease.platform === 'ios' ? '--udid' : '--serial', lease.deviceId];
  return { selector: device };
}
