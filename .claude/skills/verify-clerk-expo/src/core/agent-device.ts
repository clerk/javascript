import { readFileSync } from 'node:fs';
import { Secret } from './secret.ts';
import type { Lease } from './types.ts';

export function agentDeviceFor(lease: Lease): { readonly selector: readonly string[]; readonly env: Readonly<Record<string, string>> } {
  const device = ['--platform', lease.platform, lease.platform === 'ios' ? '--udid' : '--serial', lease.deviceId];
  if (lease.backend === 'local') return { selector: device, env: {} };
  const token = new Secret('session-bearer', readFileSync(lease.tokenFile, 'utf8').trim());
  return {
    selector: [...device, '--daemon-base-url', `${lease.baseUrl}/agent-device`],
    env: token.use('agent-device-daemon', (plain) => ({ AGENT_DEVICE_DAEMON_AUTH_TOKEN: plain })),
  };
}
