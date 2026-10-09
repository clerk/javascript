import { randomBytes } from 'node:crypto';
import { Secret } from './secret.ts';
import type { AppEntry, Platform, PublishableKey, RunId } from './types.ts';

type Env = Readonly<Record<string, string | undefined>>;

export type Device =
  | { readonly kind: 'local'; readonly id: string }
  | { readonly kind: 'borrowed'; readonly id: string; readonly daemonUrl: string; readonly tokenFile: string };

export interface AppBuild {
  readonly path: string | null;
  readonly devServer: string | null;
}

export interface Target {
  readonly platform: Platform;
  readonly device: Device;
  readonly session: string;
  readonly build: AppBuild;
}

export type ClerkAccess =
  | { readonly kind: 'secret-key'; readonly key: Secret<'clerk-secret-key'> }
  | { readonly kind: 'stand-in'; readonly url: string; readonly tokenFile: string };

export interface ClerkInstance {
  readonly publishableKey: PublishableKey;
  readonly access: ClerkAccess;
}

export interface Inputs {
  readonly target: Target;
  readonly clerk: ClerkInstance;
  readonly run: RunId;
}

export interface TestApp {
  readonly platforms: readonly [Platform, ...Platform[]];
  id(platform: Platform): string;
  entry(platform: Platform, devServer: string | null): AppEntry;
}

const NAMES = {
  platform: 'CLERK_E2E_PLATFORM',
  device: 'CLERK_E2E_DEVICE',
  session: 'CLERK_E2E_DEVICE_SESSION',
  daemonUrl: 'CLERK_E2E_DEVICE_DAEMON_URL',
  daemonTokenFile: 'CLERK_E2E_DEVICE_DAEMON_TOKEN_FILE',
  appPath: 'CLERK_E2E_APP_PATH',
  devServer: 'CLERK_E2E_DEV_SERVER',
  publishableKey: 'CLERK_PUBLISHABLE_KEY',
  secretKey: 'CLERK_SECRET_KEY',
  apiUrl: 'CLERK_E2E_API_URL',
  apiTokenFile: 'CLERK_E2E_API_TOKEN_FILE',
  run: 'CLERK_E2E_RUN_ID',
} as const;

export const INPUT_VARIABLES: readonly string[] = Object.values(NAMES);

const given = (env: Env, name: string): string | null => {
  const value = env[name]?.trim();
  return value === undefined || value === '' ? null : value;
};

const DEVICES: Readonly<Record<Platform, { readonly id: RegExp; readonly expects: string; readonly listedBy: string }>> = {
  ios: { id: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i, expects: 'the UDID of a simulator; a name is not accepted', listedBy: 'xcrun simctl list devices booted' },
  android: { id: /^emulator-\d+$/, expects: 'the emulator-<port> serial of an emulator; an AVD name, a host:port address, and the serial of a phone are not accepted', listedBy: 'adb devices' },
};

function readPlatform(app: TestApp, env: Env): Platform {
  const named = given(env, NAMES.platform);
  const [only, ...others] = app.platforms;
  if (named === null) {
    if (others.length === 0) return only;
    throw new Error(`${NAMES.platform} is not set, and this test app runs on ${app.platforms.join(' and ')}; set it to one of them`);
  }
  const platform = app.platforms.find((candidate) => candidate === named);
  if (platform === undefined) throw new Error(`${NAMES.platform} is ${named}, and this test app runs on ${app.platforms.join(' and ')}`);
  return platform;
}

function readDevice(platform: Platform, env: Env): Device {
  const id = given(env, NAMES.device);
  const { id: shape, expects, listedBy } = DEVICES[platform];
  if (id === null) throw new Error(`${NAMES.device} is not set; set it to the id of a booted device, which \`${listedBy}\` prints`);
  if (!shape.test(id)) throw new Error(`${NAMES.device} is ${id}, which is not ${expects}, so copy the id that \`${listedBy}\` prints`);
  const daemonUrl = given(env, NAMES.daemonUrl);
  if (daemonUrl === null) return { kind: 'local', id };
  if (!/^https?:\/\/\S+$/.test(daemonUrl)) throw new Error(`${NAMES.daemonUrl} is ${daemonUrl}, which is not the http or https address of an agent-device daemon`);
  const tokenFile = given(env, NAMES.daemonTokenFile);
  if (tokenFile === null) throw new Error(`${NAMES.daemonUrl} is set and ${NAMES.daemonTokenFile} is not; the daemon of a borrowed device needs its token file`);
  return { kind: 'borrowed', id, daemonUrl, tokenFile };
}

export function readTarget(app: TestApp, env: Env): Target {
  const platform = readPlatform(app, env);
  return {
    platform,
    device: readDevice(platform, env),
    session: given(env, NAMES.session) ?? `clerk-e2e-${platform}`,
    build: { path: given(env, NAMES.appPath), devServer: given(env, NAMES.devServer) },
  };
}

const LOOPBACK = /^http:\/\/127\.0\.0\.1:\d{1,5}(\/|$)/;

export function readClerk(env: Env): ClerkInstance {
  const publishableKey = given(env, NAMES.publishableKey);
  if (publishableKey === null) throw new Error(`${NAMES.publishableKey} is not set; set it to the publishable key of a development instance`);
  if (!publishableKey.startsWith('pk_test_')) throw new Error(`${NAMES.publishableKey} is not a pk_test_ key; these tests create and sign in users, so they run against a development instance only`);
  const secretKey = given(env, NAMES.secretKey);
  const url = given(env, NAMES.apiUrl);
  if (secretKey !== null && url !== null) throw new Error(`${NAMES.secretKey} and ${NAMES.apiUrl} are both set; set one, so there is one way to reach Clerk`);
  if (secretKey !== null) {
    if (!secretKey.startsWith('sk_test_')) throw new Error(`${NAMES.secretKey} is not an sk_test_ key; these tests create and sign in users, so they run against a development instance only`);
    return { publishableKey: publishableKey as PublishableKey, access: { kind: 'secret-key', key: new Secret('clerk-secret-key', secretKey) } };
  }
  if (url === null) throw new Error(`${NAMES.secretKey} is not set; set it to the secret key of the same development instance as ${NAMES.publishableKey}`);
  if (!LOOPBACK.test(url)) throw new Error(`${NAMES.apiUrl} is ${url}, which is not an http://127.0.0.1:<port> address; only a stand-in on this machine may take the place of Clerk's Backend API`);
  const tokenFile = given(env, NAMES.apiTokenFile);
  if (tokenFile === null) throw new Error(`${NAMES.apiUrl} is set and ${NAMES.apiTokenFile} is not; the stand-in at that address needs its token file`);
  return { publishableKey: publishableKey as PublishableKey, access: { kind: 'stand-in', url, tokenFile } };
}

const RUN_ID = /^r\d{8}-\d{6}-[0-9a-f]{4}$/;

export const isRunId = (value: string): value is RunId => RUN_ID.test(value);

export function newRunId(): RunId {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `r${date}-${time}-${randomBytes(2).toString('hex')}` as RunId;
}

export function readRun(env: Env): RunId {
  const named = given(env, NAMES.run);
  if (named === null) return newRunId();
  if (!isRunId(named)) throw new Error(`${NAMES.run} is ${named}, which is not a run id like r20261002-141210-7c1e; unset it and the tests make one`);
  return named;
}

export function inputsEnv(inputs: Inputs): Readonly<Record<string, string>> {
  const { target, clerk } = inputs;
  return {
    [NAMES.platform]: target.platform,
    [NAMES.device]: target.device.id,
    ...(target.device.kind === 'borrowed' ? { [NAMES.daemonUrl]: target.device.daemonUrl, [NAMES.daemonTokenFile]: target.device.tokenFile } : {}),
    [NAMES.session]: target.session,
    ...(target.build.path === null ? {} : { [NAMES.appPath]: target.build.path }),
    ...(target.build.devServer === null ? {} : { [NAMES.devServer]: target.build.devServer }),
    [NAMES.publishableKey]: clerk.publishableKey,
    ...(clerk.access.kind === 'secret-key'
      ? { [NAMES.secretKey]: clerk.access.key.use('test-process-environment', (plain) => plain) }
      : { [NAMES.apiUrl]: clerk.access.url, [NAMES.apiTokenFile]: clerk.access.tokenFile }),
    [NAMES.run]: inputs.run,
  };
}
