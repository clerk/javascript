import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { E2EConfig } from 'e2e';
import { mobile } from '@e2e-dev/mobile';
import { readAgent } from './agent.ts';
import { VerifyFailure, type Lease, type RunContext } from './types.ts';
import { agentDeviceStateDir } from './workspace.ts';

export const ASSERTION_TIMEOUT_MS = 10_000;
export const TEST_TIMEOUT_MS = 240_000;

const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const LEASE_CONTEXT = join(SKILL_DIR, '.verify', 'context.json');

function parseContext(text: string, source: string): RunContext {
  const raw = JSON.parse(text) as Partial<RunContext>;
  if (raw.v !== 1 || typeof raw.workspace !== 'string' || !Array.isArray(raw.targets) || typeof raw.agentDeviceSession !== 'string') {
    throw new VerifyFailure('NOT_READY', `${source} is not a verify run context`, 'run specs through `{cli} run`');
  }
  return raw as RunContext;
}

export function loadRunContext(): RunContext {
  const named = process.env.VERIFY_CONTEXT;
  if (named !== undefined && named !== '') return parseContext(readFileSync(named, 'utf8'), named);
  if (!existsSync(LEASE_CONTEXT)) {
    throw new VerifyFailure('NOT_READY', 'no device is leased for this worktree', '{cli} up');
  }
  const context = parseContext(readFileSync(LEASE_CONTEXT, 'utf8'), LEASE_CONTEXT);
  if (!context.targets.every((t) => existsSync(t.leaseFile))) throw new VerifyFailure('NOT_READY', 'the lease this context names was released', '{cli} up');
  return context;
}

const requireOnlyForAnAgent = createRequire(import.meta.url);

function agentConfig(env: Readonly<Record<string, string | undefined>>): Pick<E2EConfig, 'agents' | 'cache'> {
  const agent = readAgent(env);
  if (agent === null) return {};
  const { createGateway } = requireOnlyForAnAgent('ai') as typeof import('ai');
  const gateway = agent.credential.key.use('gateway-provider', (apiKey) => createGateway({ apiKey }));
  return { agents: { default: { model: gateway(agent.model), providerOptions: { gateway: { models: [agent.backup] } } } }, cache: 'off' };
}

export function composeE2EConfig(context: RunContext, env: Readonly<Record<string, string | undefined>> = process.env): E2EConfig {
  process.env.AGENT_DEVICE_STATE_DIR ??= agentDeviceStateDir(context.workspace);
  const targets = context.targets.map((target) => {
    const lease = JSON.parse(readFileSync(target.leaseFile, 'utf8')) as Lease;
    return {
      name: target.platform,
      engine: mobile({ platform: target.platform, device: [lease.deviceId], session: context.agentDeviceSession, videoTouches: false }),
      app: { bundleId: target.appId, ...(target.appPath === null ? {} : { appPath: target.appPath }) },
    };
  });
  return {
    tests: ['specs/**/*.e2e.ts'],
    targets,
    workers: 1,
    timeout: TEST_TIMEOUT_MS,
    assertionTimeout: ASSERTION_TIMEOUT_MS,
    trace: 'off',
    ...agentConfig(env),
  };
}
