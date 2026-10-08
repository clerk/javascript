import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test as base } from '@e2e-dev/mobile';
import { expect, type Locator } from 'e2e';
import { agentDeviceFor } from '../src/core/agent-device.ts';
import { deviceCommand } from '../src/core/device-command.ts';
import { ASSERTION_TIMEOUT_MS, loadRunContext } from '../src/core/e2e-config.ts';
import { Secret, redact } from '../src/core/secret.ts';
import { appStart, performAppStart } from '../src/core/state.ts';
import { tapOnceUncovered } from '../src/core/tapping.ts';
import { typeConfirmed } from '../src/core/typing.ts';
import { agentDeviceStateDir } from '../src/core/workspace.ts';
import {
  APP_ELEMENT_IDS,
  CLERK_TEST_CODE,
  VerifyFailure,
  signedInText,
  type AppLocators,
  type BrokerLaunchRequest,
  type BrokerLaunchResponse,
  type BrokerSeedRequest,
  type BrokerSeedResponse,
  type ErrorCode,
  type HostFixture,
  type LaunchOptions,
  type Lease,
  type RunContext,
  type RunTarget,
  type SeededUser,
  type StorageScope,
  type TestEmail,
  type TestPhone,
} from '../src/core/types.ts';

export { expect, CLERK_TEST_CODE };

const LAUNCH_TIMEOUT_MS = 60_000;
const POLL_MS = 400;
const TYPING_DELAY_MS = 40;
const CONFIRM_READS = 5;
const ONLY_E2E_WORKER_SLOT = 0;

const e2eWorkerSession = (context: RunContext): string => `${context.agentDeviceSession}-${ONLY_E2E_WORKER_SLOT}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function adb(target: RunTarget, args: readonly string[]): Promise<void> {
  const result = await deviceCommand(JSON.parse(readFileSync(target.leaseFile, 'utf8')) as Lease, args);
  if (result.code !== 0) throw new Error(`adb ${args[0]} failed: ${result.stderr.trim() || result.stdout.trim() || `exit ${result.code}`}`);
}

function agentDevice(context: RunContext, target: RunTarget, args: readonly string[]): Promise<void> {
  const device = agentDeviceFor(JSON.parse(readFileSync(target.leaseFile, 'utf8')) as Lease);
  return new Promise((resolve, reject) => {
    const bin = join(dirname(context.workspace), 'node_modules', '.bin', 'agent-device');
    const env = { ...process.env, AGENT_DEVICE_STATE_DIR: agentDeviceStateDir(context.workspace), ...device.env };
    execFile(bin, [...args, '--delay-ms', String(TYPING_DELAY_MS), '--session', e2eWorkerSession(context), ...device.selector], { env }, (error, _stdout, stderr) => {
      if (error === null) resolve();
      else reject(new Error(redact(`agent-device ${args[0]} failed: ${stderr.trim() || error.message}`)));
    });
  });
}

export const test = base.extend<{ host: HostFixture }>({
  host: async ({ app: e2eApp, device, screen, platform }, use) => {
    const context = loadRunContext();
    if (context.run === null) {
      throw new VerifyFailure('NOT_READY', 'host needs the broker that `{cli} run` starts', 'run this spec with `{cli} run <path>`');
    }
    const { run, broker } = context;
    const target = context.targets.find((t) => t.platform === platform);
    if (target === undefined) throw new VerifyFailure('NOT_READY', `the run context has no ${platform} target`, '{cli} up');
    const app = Object.fromEntries(Object.entries(APP_ELEMENT_IDS).map(([name, id]) => [name, screen.getByTestId(id)])) as AppLocators;
    let lastScope: StorageScope | null = null;

    async function call<T>(path: string, body: unknown): Promise<T> {
      const token = readFileSync(broker.tokenFile, 'utf8');
      const response = await fetch(`${broker.url}${path}`, {
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

    const onScreen = async (locator: Locator): Promise<boolean> => (await locator.count().catch(() => 0)) > 0;

    async function textOf(locator: Locator): Promise<string | null> {
      try {
        return (await locator.count()) === 1 ? await locator.textContent() : null;
      } catch {
        return null;
      }
    }

    async function homeShows(): Promise<string> {
      const heading = await textOf(app.signedIn);
      if (heading !== null) return `the home shows "${heading}", user ID ${(await textOf(app.userId)) ?? 'none'}, session ID ${(await textOf(app.sessionId)) ?? 'none'}`;
      return (await onScreen(app.signedOut)) ? 'the home shows "Signed out"' : 'the home is not on screen';
    }

    async function dismissSavePasswordPrompt(): Promise<void> {
      if ((await screen.getByText('Save Password?').count()) === 0) return;
      await screen.getByRole('button', { name: 'Not Now' }).tap({ timeout: ASSERTION_TIMEOUT_MS });
    }

    async function until(reached: () => Promise<boolean>, waitingFor: string, timeoutMs: number): Promise<void> {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        if (await reached()) return;
        const failure = await textOf(app.error);
        if (failure !== null) throw new Error(`the app did not show ${waitingFor}; it shows its error screen: ${failure}`);
        await dismissSavePasswordPrompt().catch(() => undefined);
        if (Date.now() >= deadline) throw new Error(`the app did not show ${waitingFor} within ${timeoutMs}ms; ${await homeShows()}`);
        await sleep(POLL_MS);
      }
    }

    const signedInAs = (who: SeededUser | TestEmail) => async (): Promise<boolean> => {
      const email = typeof who === 'string' ? who : who.email;
      if ((await textOf(app.signedIn)) !== signedInText(email)) return false;
      const userId = (await textOf(app.userId)) ?? '';
      if (typeof who === 'string' ? userId.length === 0 : userId !== who.id) return false;
      return ((await textOf(app.sessionId)) ?? '').length > 0;
    };
    const describeSignedIn = (who: SeededUser | TestEmail): string =>
      typeof who === 'string' ? `"${signedInText(who)}" with a user ID and a session ID on the home` : `"${signedInText(who.email)}" with user ID ${who.id} and a session ID on the home`;
    const signedOut = async (): Promise<boolean> => {
      if (!(await onScreen(app.signedOut))) return false;
      for (const gone of [app.signedIn, app.userId, app.sessionId]) if (await onScreen(gone)) return false;
      return true;
    };

    function landing(options: LaunchOptions): { readonly reached: () => Promise<boolean>; readonly what: string } {
      const on = (locator: Locator, what: string) => ({ reached: () => onScreen(locator), what });
      if (options.landsOn !== undefined) return on(options.landsOn, 'the screen the spec names in landsOn');
      const user = options.signedInAs ?? null;
      if (user !== null) return { reached: signedInAs(user), what: describeSignedIn(user) };
      if (options.keepStorage === true) {
        throw new VerifyFailure('USAGE', 'a launch with keepStorage and no signedInAs has no landing the fixture can know', 'pass landsOn with the locator the launch should show');
      }
      return on(app.signIn, 'the "Sign in" button on the home');
    }

    const host: HostFixture = {
      runId: run,
      app,
      async newEmail() {
        return (await call<{ email: TestEmail }>('/reserveEmail', {})).email;
      },
      async newPhone() {
        return (await call<{ phone: TestPhone }>('/reservePhone', {})).phone;
      },
      async seedUser(options = {}) {
        const request: BrokerSeedRequest = { phone: options.phone === true, password: options.password === true };
        const seeded = await call<BrokerSeedResponse>('/seedUser', request);
        return { ...seeded, password: seeded.password === null ? null : new Secret('password', seeded.password) };
      },
      async launch(options = {}) {
        const lands = landing(options);
        const request: BrokerLaunchRequest = {
          platform: target.platform,
          user: options.signedInAs ?? null,
          authMode: options.authMode ?? null,
          initialIdentifier: options.initialIdentifier ?? null,
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
        await until(lands.reached, `${lands.what} after launch ${launch.launchId}`, LAUNCH_TIMEOUT_MS);
      },
      expectSignedInAs: (who, timeoutMs = ASSERTION_TIMEOUT_MS) => until(signedInAs(who), describeSignedIn(who), timeoutMs),
      expectSignedOut: (timeoutMs = ASSERTION_TIMEOUT_MS) => until(signedOut, '"Signed out" and no user ID or session ID on the home', timeoutMs),
      async screenshot(label) {
        await e2eApp.screenshot(label);
      },
      tap: (target) => tapOnceUncovered(() => target.tap({ timeout: ASSERTION_TIMEOUT_MS }), { timeoutMs: ASSERTION_TIMEOUT_MS, now: Date.now, wait: () => sleep(POLL_MS) }),
      async fill(field, text) {
        const plain = typeof text === 'string' ? text : text.use('device-input', (value) => value);
        await host.tap(field);
        const focused = device.locator('role=textbox focused');
        const frame = async () => ((await focused.count()) === 1 ? await focused.boundingBox() : null);
        const input = await frame().catch(() => null);
        await typeConfirmed(
          {
            type: (value) => agentDevice(context, target, ['type', value]),
            async valueIfReadable() {
              const now = await frame().catch(() => null);
              if (input === null || now === null || now.x !== input.x || now.y !== input.y || now.width !== input.width || now.height !== input.height) return null;
              return focused.inputValue().catch(() => null);
            },
            refocus: () => focused.tap({ timeout: ASSERTION_TIMEOUT_MS }),
            tapAgain: () => host.tap(field),
            async replace(value) {
              if (input !== null) await agentDevice(context, target, ['fill', String(Math.round(input.x + input.width / 2)), String(Math.round(input.y + input.height / 2)), value]);
            },
            ...(platform === 'android' ? { nothingFocused: async () => (await focused.count()) !== 1 } : {}),
          },
          plain,
          { reads: CONFIRM_READS, wait: () => sleep(POLL_MS) },
        );
      },
    };
    await use(host);
  },
});
