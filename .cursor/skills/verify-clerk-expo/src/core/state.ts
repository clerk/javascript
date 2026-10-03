import {
  AUTH_MODES,
  HOST_CONTRACT_VERSION,
  STATE_TEXT_PREFIX,
  VerifyFailure,
  type HostEntry,
  type HostLaunch,
  type LaunchId,
  type Platform,
  type RunId,
  type TicketState,
  type VerifyState,
} from './types.ts';

const TICKETS: readonly TicketState[] = ['none', 'pending', 'succeeded', 'failed'];

function malformed(detail: string): VerifyFailure {
  return new VerifyFailure(
    'HOST_CONTRACT_MISMATCH',
    `verify.state is not a VerifyState: ${detail}`,
    'rebuild the host with `bin/verify up` so it matches this skill',
  );
}

function nullableString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw malformed(`${key} is not a string`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseVerifyState(text: string): VerifyState {
  const trimmed = text.trim();
  const json = trimmed.startsWith(STATE_TEXT_PREFIX) ? trimmed.slice(STATE_TEXT_PREFIX.length) : trimmed;
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw malformed('the text after the prefix is not JSON');
  }
  if (!isRecord(raw)) throw malformed('not an object');
  if (raw.v !== HOST_CONTRACT_VERSION) {
    throw new VerifyFailure(
      'HOST_CONTRACT_MISMATCH',
      `host reports contract v${String(raw.v)}, this skill speaks v${HOST_CONTRACT_VERSION}`,
      'rebuild the host from this worktree with `bin/verify up`, or update the skill',
    );
  }
  if (typeof raw.screen !== 'string') throw malformed('screen is not a string');
  for (const key of ['environmentLoaded', 'signedIn'] as const) {
    if (typeof raw[key] !== 'boolean') throw malformed(`${key} is not a boolean`);
  }
  const ticket = TICKETS.find((t) => t === raw.ticket);
  if (ticket === undefined) throw malformed('ticket is not none, pending, succeeded, or failed');
  const sessionStatus = nullableString(raw, 'sessionStatus');
  if (sessionStatus !== null && sessionStatus !== 'active' && sessionStatus !== 'pending') {
    throw malformed('sessionStatus is not active, pending, or null');
  }
  const pendingTasks = raw.pendingTasks ?? [];
  if (!Array.isArray(pendingTasks) || !pendingTasks.every((t) => typeof t === 'string')) {
    throw malformed('pendingTasks is not a list of strings');
  }
  let lastError: VerifyState['lastError'] = null;
  if (raw.lastError !== null && raw.lastError !== undefined) {
    const e = raw.lastError;
    if (!isRecord(e) || typeof e.code !== 'string' || typeof e.message !== 'string') throw malformed('lastError is malformed');
    lastError = { code: e.code, message: e.message };
  }
  let extra: VerifyState['extra'];
  if (raw.extra !== undefined) {
    if (!isRecord(raw.extra)) throw malformed('extra is not an object');
    const scalars: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(raw.extra)) {
      if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) throw malformed(`extra.${key} is not a scalar`);
      scalars[key] = value as string | number | boolean | null;
    }
    extra = scalars;
  }
  return {
    v: HOST_CONTRACT_VERSION,
    runId: nullableString(raw, 'runId') as RunId | null,
    launchId: nullableString(raw, 'launchId') as LaunchId | null,
    screen: raw.screen,
    environmentLoaded: raw.environmentLoaded as boolean,
    signedIn: raw.signedIn as boolean,
    userId: nullableString(raw, 'userId'),
    sessionId: nullableString(raw, 'sessionId'),
    sessionStatus,
    pendingTasks,
    orgId: nullableString(raw, 'orgId'),
    signInStatus: nullableString(raw, 'signInStatus'),
    signUpStatus: nullableString(raw, 'signUpStatus'),
    ticket,
    lastError,
    ...(extra === undefined ? {} : { extra }),
  };
}

export const count = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? '' : 's'}`;

export function describeState(state: VerifyState): string {
  const parts = [`screen=${state.screen}`, `signedIn=${state.signedIn}`, `userId=${state.userId ?? 'null'}`];
  if (state.sessionStatus) parts.push(`session=${state.sessionStatus}`);
  parts.push(`orgId=${state.orgId ?? 'null'}`);
  if (state.pendingTasks.length > 0) parts.push(`tasks=${state.pendingTasks.join(',')}`);
  if (state.signInStatus) parts.push(`signInStatus=${state.signInStatus}`);
  if (state.signUpStatus) parts.push(`signUpStatus=${state.signUpStatus}`);
  if (state.ticket !== 'none') parts.push(`ticket=${state.ticket}`);
  parts.push(`lastError=${state.lastError === null ? 'null' : state.lastError.code}`);
  return parts.join(' ');
}

const PLIST_LEADERS = ['(', '{', '<', '"'];

function checkedValue(key: string, value: string): string {
  if (value.length === 0) throw new VerifyFailure('USAGE', `launch input ${key} is empty`, 'pass a non-empty value');
  if (PLIST_LEADERS.some((leader) => value.startsWith(leader))) {
    throw new VerifyFailure(
      'USAGE',
      `launch input ${key} starts with ${value[0]}, which iOS would parse as a property list`,
      'pass a plain string value',
    );
  }
  return value;
}

export function encodeLaunchArguments(platform: Platform, launch: HostLaunch<string>): readonly string[] {
  if (launch.verifyAuthMode !== undefined && !AUTH_MODES.includes(launch.verifyAuthMode)) {
    throw new VerifyFailure('USAGE', `unknown auth mode ${launch.verifyAuthMode}`, `use one of ${AUTH_MODES.join(', ')}`);
  }
  const pairs: [string, string][] = [
    ['verifyPublishableKey', launch.verifyPublishableKey],
    ['verifyRunId', launch.verifyRunId],
    ['verifyStorageScope', launch.verifyStorageScope],
    ['verifyLaunchId', launch.verifyLaunchId],
  ];
  if (launch.verifyScreen !== undefined) pairs.push(['verifyScreen', launch.verifyScreen]);
  if (launch.verifyAuthMode !== undefined) pairs.push(['verifyAuthMode', launch.verifyAuthMode]);
  if (launch.verifyLogLevel !== undefined) pairs.push(['verifyLogLevel', launch.verifyLogLevel]);
  const ticket = launch.verifySignInTicket?.use('launch-argument', (plain) => plain);
  if (ticket !== undefined) pairs.push(['verifySignInTicket', ticket]);
  return pairs.flatMap(([key, value]) => {
    const checked = checkedValue(key, value);
    switch (platform) {
      case 'ios':
        return [`-${key}`, checked];
      case 'android':
        return ['--es', key, checked];
      default: {
        const exhaustive: never = platform;
        return exhaustive;
      }
    }
  });
}

export type AppStart =
  | { readonly kind: 'open-app'; readonly launchArguments: readonly string[] }
  | { readonly kind: 'adb'; readonly commands: readonly (readonly string[])[] };

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

export function appStart(platform: Platform, appId: string, entry: HostEntry, launchArguments: readonly string[]): AppStart {
  if (entry.kind === 'binary') return { kind: 'open-app', launchArguments };
  const all = [...entry.launchArguments, ...launchArguments];
  if (platform === 'ios') {
    if (entry.openLink !== null) {
      throw new VerifyFailure('NOT_READY', 'a dev-client entry on iOS cannot use openLink yet', 'pass the URL as a launch argument in entry.launchArguments, such as --initialUrl <url>');
    }
    return { kind: 'open-app', launchArguments: all };
  }
  if (entry.androidActivity === null) {
    throw new VerifyFailure('NOT_READY', 'a dev-client entry on Android needs androidActivity', 'set androidActivity in the entry src/host.ts returns');
  }
  const start = ['am', 'start', '-W', '-n', `${appId}/${entry.androidActivity}`, ...(entry.openLink === null ? [] : ['-d', entry.openLink]), ...all];
  return {
    kind: 'adb',
    commands: [
      ['shell', `am force-stop ${shellQuote(appId)}`],
      ['shell', start.map(shellQuote).join(' ')],
    ],
  };
}

export interface AppStartDriver {
  openApp(appId: string, options?: { readonly relaunch: true; readonly launchArguments: readonly string[] }): Promise<void>;
  adb(args: readonly string[]): Promise<void>;
}

/** After `am start`, a plain openApp binds the worker's agent-device session to the device without relaunching the app. */
export async function performAppStart(start: AppStart, appId: string, driver: AppStartDriver): Promise<void> {
  if (start.kind === 'open-app') {
    await driver.openApp(appId, { relaunch: true, launchArguments: start.launchArguments });
    return;
  }
  for (const command of start.commands) await driver.adb(command);
  await driver.openApp(appId);
}
