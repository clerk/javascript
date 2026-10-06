import { execFile } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test as base } from '@e2e-dev/mobile';
import { expect } from 'e2e';
import { agentDeviceFor } from '../src/core/agent-device.ts';
import { deviceCommand } from '../src/core/device-command.ts';
import { ASSERTION_TIMEOUT_MS, loadRunContext } from '../src/core/e2e-config.ts';
import { appStart, describeState, parseVerifyState, performAppStart } from '../src/core/state.ts';
import { agentDeviceStateDir } from '../src/core/workspace.ts';
import type { host as hostAdapter } from '../src/host.ts';
import {
  CLERK_TEST_CODE,
  STATE_ELEMENT_ID,
  VerifyFailure,
  type BrokerLaunchRequest,
  type BrokerLaunchResponse,
  type ErrorCode,
  type HostFixture,
  type InstanceSettings,
  type Lease,
  type RunContext,
  type RunTarget,
  type SeededUser,
  type StorageScope,
  type TestEmail,
  type VerifyState,
} from '../src/core/types.ts';

type HostScreen = (typeof hostAdapter)['screens'][number];

export { expect, CLERK_TEST_CODE };
export type { InstanceSettings };

const LAUNCH_TIMEOUT_MS = 60_000;
const POLL_MS = 400;
const ONLY_E2E_WORKER_SLOT = 0;

const e2eWorkerSession = (context: RunContext): string => `${context.agentDeviceSession}-${ONLY_E2E_WORKER_SLOT}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function adb(target: RunTarget, args: readonly string[]): Promise<void> {
  const result = await deviceCommand(JSON.parse(readFileSync(target.leaseFile, 'utf8')) as Lease, args);
  if (result.code !== 0) throw new Error(`adb ${args[0]} failed: ${result.stderr.trim() || result.stdout.trim() || `exit ${result.code}`}`);
}

function typeIntoFocused(context: RunContext, target: RunTarget, text: string): Promise<void> {
  const device = agentDeviceFor(JSON.parse(readFileSync(target.leaseFile, 'utf8')) as Lease);
  return new Promise((resolve, reject) => {
    const bin = join(dirname(context.workspace), 'node_modules', '.bin', 'agent-device');
    const env = { ...process.env, AGENT_DEVICE_STATE_DIR: agentDeviceStateDir(context.workspace) };
    execFile(bin, ['type', text, '--session', e2eWorkerSession(context), ...device.selector], { env }, (error, _stdout, stderr) => {
      if (error === null) resolve();
      else reject(new Error(`agent-device type failed: ${stderr.trim() || error.message}`));
    });
  });
}

export const test = base.extend<{ host: HostFixture<HostScreen> }>({
  host: async ({ app, device, screen, platform }, use) => {
    const context = loadRunContext();
    const target = context.targets.find((t) => t.platform === platform);
    if (target === undefined) throw new VerifyFailure('NOT_READY', `the run context has no ${platform} target`, '{cli} up');
    const statesFile = context.run === null ? null : join(context.workspace, 'runs', context.run, 'states.jsonl');
    let lastText: string | null = null;
    let lastScope: StorageScope | null = null;

    async function call<T>(path: string, body: unknown): Promise<T> {
      if (context.broker === null) {
        throw new VerifyFailure('NOT_READY', 'host needs the broker that `{cli} run` starts', 'run this spec with `{cli} run <path>`');
      }
      const token = readFileSync(context.broker.tokenFile, 'utf8');
      const response = await fetch(`${context.broker.url}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as T & { code?: ErrorCode; message?: string; fix?: string };
      if (!response.ok) {
        throw new VerifyFailure(json.code ?? 'NOT_READY', `${json.code}: ${json.message} (fix: ${json.fix})`, json.fix ?? 'see e2e.log');
      }
      return json;
    }

    async function read(): Promise<VerifyState | null> {
      let text: string | null;
      try {
        text = await screen.getByTestId(STATE_ELEMENT_ID).textContent();
      } catch {
        return null;
      }
      if (text === null) return null;
      const state = parseVerifyState(text);
      if (statesFile !== null && text !== lastText) appendFileSync(statesFile, `${JSON.stringify(state)}\n`);
      lastText = text;
      return state;
    }

    async function tapCenter(target: Parameters<HostFixture<HostScreen>['tap']>[0]): Promise<void> {
      await target.waitFor({ state: 'visible', timeout: ASSERTION_TIMEOUT_MS });
      const box = await target.boundingBox();
      if (box === null) throw new Error('tap target has no box on screen');
      await target.tap({ position: { x: box.width / 2, y: box.height / 2 } });
    }

    async function dismissSavePasswordPrompt(): Promise<void> {
      if ((await screen.getByText('Save Password?').count()) === 0) return;
      await tapCenter(screen.getByRole('button', { name: 'Not Now' }));
    }

    async function poll(predicate: (state: VerifyState) => boolean, timeoutMs: number, waitingFor: string): Promise<VerifyState> {
      const deadline = Date.now() + timeoutMs;
      let last: VerifyState | null = null;
      for (;;) {
        const seen = await read();
        if (seen === null) await dismissSavePasswordPrompt().catch(() => undefined);
        last = seen ?? last;
        if (last !== null && predicate(last)) return last;
        if (Date.now() >= deadline) {
          throw new Error(`verify.state did not reach ${waitingFor} within ${timeoutMs}ms; last state: ${last === null ? 'none' : describeState(last)}`);
        }
        await sleep(POLL_MS);
      }
    }

    const host: HostFixture<HostScreen> = {
      async newEmail() {
        return (await call<{ email: TestEmail }>('/reserveEmail', {})).email;
      },
      async seedUser(options = {}) {
        return call<SeededUser>('/seedUser', { phone: options.phone === true });
      },
      async launch(options) {
        const user = options.signedInAs ?? null;
        const request: BrokerLaunchRequest = {
          platform: target.platform,
          user,
          screen: options.screen ?? null,
          authMode: options.authMode ?? null,
          debugLogs: options.debugLogs === true,
          storageScope: options.keepStorage === true ? lastScope : null,
        };
        const launch = await call<BrokerLaunchResponse>('/launch', request);
        lastScope = launch.storageScope;
        const start = appStart(target.platform, target.appId, target.entry, launch.launchArguments);
        await performAppStart(start, target.appId, {
          openApp: (appId, options) => (options === undefined ? device.openApp(appId) : device.openApp(appId, { relaunch: true, launchArguments: [...options.launchArguments] })),
          adb: (args) => adb(target, args),
        });
        const ready = (s: VerifyState) =>
          s.launchId === launch.launchId &&
          (s.lastError !== null || (s.environmentLoaded && (user === null || s.ticket === 'succeeded' || s.ticket === 'failed')));
        return poll(ready, LAUNCH_TIMEOUT_MS, `launch ${launch.launchId} ready`);
      },
      async state() {
        const state = await read();
        if (state === null) throw new Error(`no ${STATE_ELEMENT_ID} element on screen`);
        return state;
      },
      waitForState(predicate, timeoutMs = ASSERTION_TIMEOUT_MS) {
        return poll(predicate, timeoutMs, 'the expected state');
      },
      async screenshot(label) {
        await app.screenshot(label);
      },
      tap: tapCenter,
      async fill(field, text) {
        await host.tap(field);
        await typeIntoFocused(context, target, text);
      },
    };
    await use(host);
  },
});
