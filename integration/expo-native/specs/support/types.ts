import type { Locator } from 'e2e';

declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type Platform = 'ios' | 'android';

export type AuthMode = 'signIn' | 'signUp' | 'signInOrUp';

export type RunId = Brand<string, 'RunId'>;
export type LaunchId = Brand<string, 'LaunchId'>;
export type StorageScope = Brand<string, 'StorageScope'>;
export type PublishableKey = Brand<string, 'PublishableKey'>;
export type TestEmail = Brand<string, 'TestEmail'>;
export type TestPhone = Brand<string, 'TestPhone'>;

export const APP_ELEMENT_IDS = {
  signIn: 'e2e.auth.signIn',
  signInFullScreen: 'e2e.auth.signInFullScreen',
  signedOut: 'e2e.auth.signedOut',
  signedIn: 'e2e.auth.signedIn',
  userId: 'e2e.auth.userId',
  sessionId: 'e2e.auth.sessionId',
  signOut: 'e2e.auth.signOut',
  error: 'e2e.launch.error',
} as const;

export type AppLocators = { readonly [K in keyof typeof APP_ELEMENT_IDS]: Locator };

export const signedInText = (email: string): string => `Signed in as ${email}`;

export const CLERK_TEST_CODE = '424242' as const;

export interface SecretLike {
  readonly name: string;
  use<T>(sink: SecretSink, fn: (plain: string) => T): T;
}

export type SecretSink = 'bapi-authorization' | 'launch-argument' | 'agent-device-daemon' | 'e2e-provider-lease' | 'github-authorization' | 'session-bearer' | 'platform-authorization' | 'one-password-read' | 'bapi-user-password' | 'device-input' | 'gateway-provider' | 'e2e-agent-environment' | 'test-process-environment';

export interface HostLaunch {
  readonly verifyPublishableKey: PublishableKey;
  readonly verifyRunId: RunId;
  readonly verifyStorageScope: StorageScope;
  readonly verifyLaunchId: LaunchId;
  readonly verifyAuthMode?: AuthMode;
  readonly verifyInitialIdentifier?: string;
  readonly verifySignInTicket?: SecretLike;
  readonly verifyLogLevel?: 'debug';
}

export type AppEntry =
  | { readonly kind: 'binary' }
  | {
      readonly kind: 'dev-client';
      readonly launchArguments: readonly string[];
      readonly openLink: string | null;
      readonly androidActivity: string | null;
    };

export interface SeededUser {
  readonly id: string;
  readonly email: TestEmail;
  readonly phone: TestPhone | null;
  readonly password: SecretLike | null;
}

export interface SeedOptions {
  readonly phone?: boolean;
  readonly password?: boolean;
}

export interface LaunchOptions {
  readonly authMode?: AuthMode;
  readonly initialIdentifier?: string;
  readonly debugLogs?: boolean;
  readonly keepStorage?: boolean;
  readonly signedInAs?: SeededUser;
  readonly landsOn?: Locator;
}

export interface HostFixture {
  readonly runId: RunId;
  readonly app: AppLocators;
  newEmail(): Promise<TestEmail>;
  newPhone(): Promise<TestPhone>;
  seedUser(options?: SeedOptions): Promise<SeededUser>;
  launch(options?: LaunchOptions): Promise<void>;
  expectSignedInAs(who: SeededUser | TestEmail, timeoutMs?: number): Promise<void>;
  expectSignedOut(timeoutMs?: number): Promise<void>;
  screenshot(label: string): Promise<void>;
  tap(target: Locator): Promise<void>;
  fill(target: Locator, text: string | SecretLike): Promise<void>;
}
