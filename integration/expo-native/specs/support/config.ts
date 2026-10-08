import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { E2EConfig } from 'e2e';
import { mobile, type DeviceProvider } from '@e2e-dev/mobile';
import { readAgent } from './agent.ts';
import type { Device, Target, TestApp } from './inputs.ts';
import { Secret } from './secret.ts';

export const ASSERTION_TIMEOUT_MS = 10_000;
export const TEST_TIMEOUT_MS = 240_000;

export const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

type Env = Readonly<Record<string, string | undefined>>;

export function engineDevice(device: Device): readonly string[] | DeviceProvider {
  if (device.kind === 'local') return [device.id];
  const token = new Secret('session-bearer', readFileSync(device.tokenFile, 'utf8').trim());
  return {
    name: 'borrowed',
    acquire: async () => ({
      id: device.id,
      deviceId: device.id,
      device: device.id,
      daemon: token.use('e2e-provider-lease', (authToken) => ({ baseUrl: device.daemonUrl, authToken })),
    }),
    release: async () => {},
  };
}

const requireOnlyForAnAgent = createRequire(import.meta.url);

function agentConfig(env: Env): Pick<E2EConfig, 'agents' | 'cache'> {
  const agent = readAgent(env);
  if (agent === null) return {};
  const { createGateway } = requireOnlyForAnAgent('ai') as typeof import('ai');
  const gateway = agent.credential.key.use('gateway-provider', (apiKey) => createGateway({ apiKey }));
  return { agents: { default: { model: gateway(agent.model), providerOptions: { gateway: { models: [agent.backup] } } } }, cache: 'off' };
}

export function composeE2EConfig(app: TestApp, target: Target, env: Env): E2EConfig {
  return {
    tests: ['specs/**/*.e2e.ts'],
    targets: [
      {
        name: target.platform,
        engine: mobile({ platform: target.platform, device: engineDevice(target.device), session: target.session, videoTouches: false }),
        app: { bundleId: app.id(target.platform), appPath: target.build.path ?? undefined },
      },
    ],
    workers: 1,
    timeout: TEST_TIMEOUT_MS,
    assertionTimeout: ASSERTION_TIMEOUT_MS,
    trace: 'off',
    ...agentConfig(env),
  };
}
