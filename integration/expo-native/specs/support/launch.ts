import { redact } from './secret.ts';
import type { AppEntry, HostLaunch, LaunchId, LaunchOptions, Platform, PublishableKey, RunId, SecretLike, SeededUser, StorageScope } from './types.ts';

const PLIST_LEADERS = ['(', '{', '<', '"'];

function checkedValue(key: string, value: string): string {
  if (value.length === 0) throw new Error(`launch input ${key} is empty; pass a non-empty value`);
  if (PLIST_LEADERS.some((leader) => value.startsWith(leader))) {
    throw new Error(`launch input ${key} starts with ${value[0]}, which iOS would parse as a property list; pass a plain string value`);
  }
  return value;
}

export function encodeLaunchArguments(platform: Platform, launch: HostLaunch): readonly string[] {
  const pairs: [string, string][] = [
    ['verifyPublishableKey', launch.verifyPublishableKey],
    ['verifyRunId', launch.verifyRunId],
    ['verifyStorageScope', launch.verifyStorageScope],
    ['verifyLaunchId', launch.verifyLaunchId],
  ];
  if (launch.verifyAuthMode !== undefined) pairs.push(['verifyAuthMode', launch.verifyAuthMode]);
  if (launch.verifyInitialIdentifier !== undefined) pairs.push(['verifyInitialIdentifier', launch.verifyInitialIdentifier]);
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

export function appStart(platform: Platform, appId: string, entry: AppEntry, launchArguments: readonly string[]): AppStart {
  if (entry.kind === 'binary') return { kind: 'open-app', launchArguments };
  const all = [...entry.launchArguments, ...launchArguments];
  if (platform === 'ios') {
    if (entry.openLink !== null) {
      throw new Error('a dev-client entry on iOS cannot use openLink yet; pass the URL as a launch argument in entry.launchArguments, such as --initialUrl <url>');
    }
    return { kind: 'open-app', launchArguments: all };
  }
  if (entry.androidActivity === null) {
    throw new Error('a dev-client entry on Android needs androidActivity; set androidActivity in the entry specs/app.ts returns');
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

const messageOf = (error: unknown): string => redact(error instanceof Error ? error.message : String(error));

async function openTwiceAtMost(open: () => Promise<void>): Promise<void> {
  try {
    await open();
  } catch (first) {
    await open().catch((second: unknown) => {
      throw new Error(`the app did not open in two tries. The first failed with: ${messageOf(first)}. The second failed with: ${messageOf(second)}`, { cause: second });
    });
  }
}

export async function performAppStart(start: AppStart, appId: string, driver: AppStartDriver): Promise<void> {
  if (start.kind === 'open-app') {
    await openTwiceAtMost(() => driver.openApp(appId, { relaunch: true, launchArguments: start.launchArguments }));
    return;
  }
  for (const command of start.commands) await driver.adb(command);
  await openTwiceAtMost(() => driver.openApp(appId));
}

export interface LaunchedApp {
  readonly platform: Platform;
  readonly id: string;
  readonly entry: AppEntry;
  readonly buildPath: string | null;
  readonly publishableKey: PublishableKey;
  readonly run: RunId;
}

export interface LaunchDriver extends AppStartDriver {
  installApp(path: string): Promise<unknown>;
  signInTicket(user: SeededUser): Promise<SecretLike>;
}

export function appLauncher(app: LaunchedApp, driver: LaunchDriver, installedBuilds: Set<string>, newId: () => string): (options: LaunchOptions) => Promise<LaunchId> {
  let scope: StorageScope | null = null;
  return async (options) => {
    if (app.buildPath !== null && !installedBuilds.has(app.buildPath)) {
      await driver.installApp(app.buildPath);
      installedBuilds.add(app.buildPath);
    }
    const ticket = options.signedInAs === undefined ? undefined : await driver.signInTicket(options.signedInAs);
    scope = options.keepStorage === true && scope !== null ? scope : (newId() as StorageScope);
    const launchId = newId() as LaunchId;
    const launchArguments = encodeLaunchArguments(app.platform, {
      verifyPublishableKey: app.publishableKey,
      verifyRunId: app.run,
      verifyStorageScope: scope,
      verifyLaunchId: launchId,
      ...(options.authMode === undefined ? {} : { verifyAuthMode: options.authMode }),
      ...(options.initialIdentifier === undefined ? {} : { verifyInitialIdentifier: options.initialIdentifier }),
      ...(options.debugLogs === true ? { verifyLogLevel: 'debug' as const } : {}),
      ...(ticket === undefined ? {} : { verifySignInTicket: ticket }),
    });
    await performAppStart(appStart(app.platform, app.id, app.entry, launchArguments), app.id, driver);
    return launchId;
  };
}
