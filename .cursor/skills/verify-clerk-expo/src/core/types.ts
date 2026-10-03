import type { Locator } from 'e2e';

declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export const HOST_CONTRACT_VERSION = 1 as const;

export type Platform = 'ios' | 'android';

/** Proof that the caller holds the per-platform acquire lock. Only Workspace.withAcquireLock mints one. */
export type AcquireLock = Brand<{ readonly platform: Platform }, 'AcquireLock'>;

export type CoreScreen = 'home' | 'auth';
export type NativeHostScreen = CoreScreen | 'userProfile' | 'orgSwitcher' | 'orgList' | 'orgProfile';
export type AuthMode = 'signIn' | 'signUp' | 'signInOrUp';
export const AUTH_MODES: readonly AuthMode[] = ['signIn', 'signUp', 'signInOrUp'];

export type RunId = Brand<string, 'RunId'>;
export type LaunchId = Brand<string, 'LaunchId'>;
export type BuildKey = Brand<string, 'BuildKey'>;
export type StorageScope = Brand<string, 'StorageScope'>;
export type PublishableKey = Brand<string, 'PublishableKey'>;
export type FeatureName = Brand<string, 'FeatureName'>;
export type TestEmail = Brand<string, 'TestEmail'>;
export type TestPhone = Brand<string, 'TestPhone'>;
export type EvidencePath = Brand<string, 'EvidencePath'>;
export type ScratchPath = Brand<string, 'ScratchPath'>;

export const INSTANCE_NAMES = ['with-email-codes', 'with-session-tasks', 'with-session-tasks-setup-mfa'] as const;
export type InstanceName = (typeof INSTANCE_NAMES)[number];

export const STATE_ELEMENT_ID = 'verify.state';
export const STATE_TEXT_PREFIX = 'verify ';

export type TicketState = 'none' | 'pending' | 'succeeded' | 'failed';

export interface VerifyState {
  readonly v: typeof HOST_CONTRACT_VERSION;
  readonly runId: RunId | null;
  readonly launchId: LaunchId | null;
  readonly screen: string;
  readonly environmentLoaded: boolean;
  readonly signedIn: boolean;
  readonly userId: string | null;
  readonly sessionId: string | null;
  readonly sessionStatus: 'active' | 'pending' | null;
  readonly pendingTasks: readonly string[];
  readonly orgId: string | null;
  readonly signInStatus: string | null;
  readonly signUpStatus: string | null;
  readonly ticket: TicketState;
  readonly lastError: { readonly code: string; readonly message: string } | null;
  readonly extra?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface HostLaunch<S extends string = CoreScreen> {
  readonly verifyPublishableKey: PublishableKey;
  readonly verifyRunId: RunId;
  readonly verifyStorageScope: StorageScope;
  readonly verifyLaunchId: LaunchId;
  readonly verifyScreen?: S;
  readonly verifyAuthMode?: AuthMode;
  readonly verifySignInTicket?: SecretLike;
  readonly verifyLogLevel?: 'debug';
}

export interface SecretLike {
  readonly name: string;
  use<T>(sink: SecretSink, fn: (plain: string) => T): T;
}

export type SecretSink = 'bapi-authorization' | 'launch-argument' | 'agent-device-daemon' | 'e2e-provider-lease';

export type BackendKind = 'local' | 'eas';
export type OptInTag = 'form-entry' | 'known-bug';
export const FORM_ENTRY_TAG = 'form-entry' satisfies OptInTag;
/** Marks a spec that reproduces an open SDK bug. Excluded unless `run --include known-bug`, because e2e has no expected-failure status. */
export const KNOWN_BUG_TAG = 'known-bug' satisfies OptInTag;

export type SpecSelection = { readonly all: true } | { readonly selectors: readonly string[] };

export type Command =
  | { readonly verb: 'doctor'; readonly platform?: Platform; readonly backend?: BackendKind }
  | { readonly verb: 'up'; readonly platform?: Platform; readonly backend?: BackendKind; readonly waitSeconds: number }
  | {
      readonly verb: 'run';
      readonly selection: SpecSelection;
      readonly platform?: Platform;
      readonly backend?: BackendKind;
      readonly skip: readonly OptInTag[];
      readonly include: readonly OptInTag[];
      readonly grep?: string;
      readonly video: boolean;
      readonly waitSeconds: number;
    }
  | { readonly verb: 'screen'; readonly platform?: Platform; readonly png: boolean }
  | { readonly verb: 'attach'; readonly run: RunId; readonly pr: number; readonly screenshots: 'all' | readonly string[] }
  | { readonly verb: 'down'; readonly platform?: Platform; readonly stale: boolean; readonly dryRun: boolean };

export type Verb = Command['verb'];
export type RunCommand = Extract<Command, { verb: 'run' }>;

export interface Invocation {
  readonly command: Command;
  readonly json: boolean;
}

export type ErrorCode =
  | 'USAGE'
  | 'NOT_READY'
  | 'POOL_FULL'
  | 'LEASE_LOST'
  | 'DEVICE_BUSY'
  | 'BUILD_FAILED'
  | 'KEYS_MISSING'
  | 'INSTANCE_MISCONFIGURED'
  | 'NOT_TEST_IDENTITY'
  | 'HOST_CONTRACT_MISMATCH'
  | 'NO_SPECS'
  | 'E2E_CRASHED'
  | 'EVIDENCE_UNSAFE'
  | 'UNSUPPORTED';

export const RETRYABLE: ReadonlySet<ErrorCode> = new Set<ErrorCode>(['POOL_FULL', 'DEVICE_BUSY', 'LEASE_LOST']);

export class VerifyFailure extends Error {
  readonly code: ErrorCode;
  readonly fix: string;
  constructor(code: ErrorCode, message: string, fix: string) {
    super(message);
    this.code = code;
    this.fix = fix;
  }
}

export type DoctorCheckId =
  | 'node' | 'xcode' | 'jdk' | 'e2e-pins' | 'agent-device-global' | 'template' | 'proxy-trust' | 'keys'
  | `instance:${string}` | 'build' | 'eas' | 'kvm' | 'gh-attach' | 'core-drift' | 'stale-claims' | 'feature-map' | 'agent-device-daemon' | 'lane-ports';

export interface DoctorCheck {
  readonly id: DoctorCheckId;
  readonly ok: boolean;
  readonly detail: string;
  readonly fix?: string;
}

export interface DoctorReport {
  readonly verb: 'doctor';
  readonly ok: boolean;
  readonly backend: Readonly<Partial<Record<Platform, BackendKind>>>;
  readonly checks: readonly DoctorCheck[];
}

export interface LeaseView {
  readonly platform: Platform;
  readonly backend: BackendKind;
  readonly device: string;
  readonly installedBuild: BuildKey | null;
  readonly expiresAt: string | null;
  readonly renewed: boolean;
}

export interface BuildView {
  readonly platform: Platform;
  readonly key: BuildKey;
  readonly source: BuildSource;
  readonly reused: boolean;
  readonly seconds: number;
}

export interface UpResult {
  readonly verb: 'up';
  readonly leases: readonly LeaseView[];
  readonly builds: readonly BuildView[];
}

export interface RunResult {
  readonly verb: 'run';
  readonly dir: EvidencePath;
  readonly record: EvidenceRecord;
  readonly next: string;
}

export interface ScreenNode {
  readonly role: string;
  readonly name: string | null;
  readonly testId: string | null;
  readonly text: string | null;
  readonly depth: number;
  readonly locator: string | null;
}

export interface ScreenResult {
  readonly verb: 'screen';
  readonly platform: Platform;
  readonly device: string;
  readonly nodes: readonly ScreenNode[];
  readonly state: VerifyState | null;
  readonly png: ScratchPath | null;
}

export interface AttachResult {
  readonly verb: 'attach';
  readonly commentUrl: string;
  readonly posted: readonly EvidencePath[];
  readonly alreadyPosted: boolean;
}

export type DownResult =
  | {
      readonly verb: 'down';
      readonly dryRun: false;
      readonly released: readonly LeaseView[];
      readonly deletedUsers: number;
      readonly deletedOrganizations: number;
      readonly stoppedProcesses: readonly string[];
      readonly keptRuns: readonly RunId[];
    }
  | {
      readonly verb: 'down';
      readonly dryRun: true;
      readonly wouldRelease: readonly LeaseView[];
      readonly wouldDelete: readonly DeletionTarget[];
      readonly wouldStop: readonly string[];
      readonly keptRuns: readonly RunId[];
    };

export type DeletionTarget =
  | { readonly kind: 'user'; readonly instance: InstanceName; readonly id: string; readonly email: TestEmail }
  | { readonly kind: 'organization'; readonly instance: InstanceName; readonly id: string; readonly name: string };

export type VerbResult = DoctorReport | UpResult | RunResult | ScreenResult | AttachResult | DownResult;

export type Outcome<T extends VerbResult> =
  | ({ readonly ok: true } & T)
  | { readonly ok: false; readonly error: { readonly code: ErrorCode; readonly message: string; readonly fix: string; readonly retryable: boolean } };

export type SpecKind = 'golden' | 'explored';
export interface SpecRef {
  readonly kind: SpecKind;
  readonly path: string;
  readonly feature: FeatureName | null;
}

export type BuildSource = 'local' | 'github-actions' | 'eas-build';

export interface BuiltApp {
  readonly platform: Platform;
  readonly key: BuildKey;
  readonly appId: string;
  readonly path: ScratchPath;
  readonly source: BuildSource;
  readonly sourceSha: string | null;
}

export type DeviceName = `verify-${Platform}-${number}`;

interface LeaseBase {
  readonly platform: Platform;
  readonly acquiredAt: string;
  readonly installedBuild: BuildKey | null;
}
export interface LocalLease extends LeaseBase {
  readonly backend: 'local';
  readonly slot: number;
  readonly deviceName: DeviceName;
  readonly deviceId: string;
  readonly claimNonce: string;
}
export interface EasLease extends LeaseBase {
  readonly backend: 'eas';
  readonly sessionId: string;
  readonly sessionUrl: string;
  readonly secretsFile: string;
  readonly expiresAt: string;
}
export type Lease = LocalLease | EasLease;

export interface SeededUser {
  readonly id: string;
  readonly instance: InstanceName;
  readonly email: TestEmail;
  readonly phone: TestPhone | null;
}

export type LedgerEntry =
  | { readonly id: string; readonly kind: 'lease-intent'; readonly platform: Platform; readonly backend: BackendKind; readonly worktree: string }
  | { readonly id: string; readonly kind: 'eas-session-created'; readonly sessionId: string }
  | { readonly id: string; readonly kind: 'lease-held'; readonly platform: Platform; readonly backend: BackendKind; readonly sessionId: string | null; readonly deviceId: string | null }
  | { readonly id: string; readonly kind: 'identity'; readonly run: RunId; readonly instance: InstanceName; readonly email: TestEmail }
  | { readonly id: string; readonly kind: 'user'; readonly run: RunId; readonly instance: InstanceName; readonly userId: string; readonly email: TestEmail }
  | { readonly id: string; readonly kind: 'process'; readonly what: 'metro' | 'watch' | 'recorder' | 'agent-device'; readonly pid: number; readonly startedAt: string }
  | { readonly id: string; readonly kind: 'done'; readonly ref: string };

export type SpecStatus = 'passed' | 'failed' | 'skipped' | 'flaky' | 'interrupted';
export interface SpecResult {
  readonly spec: SpecRef;
  readonly title: string;
  readonly platform: Platform;
  readonly status: SpecStatus;
  readonly seconds: number;
  readonly error: string | null;
  readonly skipReason: string | null;
  /** Why a skipped spec was left out on purpose: an opt-in tag the run excluded, or a platform the spec does not declare. */
  readonly skippedBy: 'tag' | 'platform' | null;
  readonly tags: readonly string[];
  readonly failurePage: EvidencePath | null;
  readonly failureScreen: EvidencePath | null;
  readonly failureScreenshot: EvidencePath | null;
}

export interface EvidenceRecord {
  readonly run: RunId;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly repo: HostAdapter['repo'];
  readonly gitHead: string;
  readonly dirty: boolean;
  readonly platform: Platform;
  readonly backend: BackendKind;
  readonly device: string;
  readonly build: BuildKey;
  readonly results: readonly SpecResult[];
  readonly videos: readonly EvidencePath[];
  readonly screenshots: readonly { readonly label: string; readonly path: EvidencePath }[];
  readonly lastState: VerifyState | null;
  readonly appLog: EvidencePath | null;
  readonly e2eReport: EvidencePath;
  readonly identities: readonly { readonly email: TestEmail; readonly userId: string | null }[];
  readonly tainted: readonly EvidencePath[];
  readonly sealed: true;
}

export type LaunchOptions<S extends string = string> = {
  readonly screen?: S;
  readonly authMode?: AuthMode;
  readonly debugLogs?: boolean;
  readonly keepStorage?: boolean;
} & (
  | { readonly instance: InstanceName; readonly signedInAs?: never }
  | { readonly signedInAs: SeededUser; readonly instance?: never }
);

export interface HostFixture<S extends string = string> {
  newEmail(instance: InstanceName): Promise<TestEmail>;
  seedUser(options: { readonly instance: InstanceName; readonly phone?: boolean; readonly password?: false }): Promise<SeededUser>;
  launch(options: LaunchOptions<S>): Promise<VerifyState>;
  state(): Promise<VerifyState>;
  waitForState(predicate: (state: VerifyState) => boolean, timeoutMs?: number): Promise<VerifyState>;
  screenshot(label: string): Promise<void>;
  /**
   * Taps the middle of the locator's box. On iOS 27 a SwiftUI toolbar adds a hittable full-screen `Toolbar` node that
   * agent-device 0.21.18 treats as covering every control under it, so plain `tap()` and `fill()` refuse there.
   */
  tap(target: Locator): Promise<void>;
  /** Focuses the field with `tap`, then types `text` into it through the keyboard. Appends to what the field holds. */
  fill(target: Locator, text: string): Promise<void>;
}

export const LAUNCH_PRESETS = {
  signedOut: { instance: 'with-email-codes', screen: 'auth' },
  signedIn: { instance: 'with-email-codes', screen: 'home' },
  mfaRequired: { instance: 'with-session-tasks-setup-mfa', screen: 'home' },
  orgRequired: { instance: 'with-session-tasks', screen: 'home' },
} as const satisfies Readonly<Record<string, { readonly instance: InstanceName; readonly screen: string }>>;

export const E2E_SECRET_NAMES = [] as const;
export const CLERK_TEST_CODE = '424242' as const;

export type HostEntry =
  | { readonly kind: 'binary' }
  | {
      readonly kind: 'dev-client';
      readonly launchArguments: readonly string[];
      readonly openLink: string | null;
      /** The activity `am start -n` targets on Android, because the launcher intent agent-device sends crashes expo-dev-launcher. */
      readonly androidActivity: string | null;
    };

export interface RuntimeProcess {
  readonly what: 'metro' | 'watch';
  readonly pid: number;
  readonly startedAt: number;
}

export interface HostRuntime {
  readonly entry: HostEntry;
  readonly processes: readonly RuntimeProcess[];
}

export interface RunTarget {
  readonly platform: Platform;
  readonly appId: string;
  readonly appPath: string;
  readonly buildKey: BuildKey;
  readonly leaseFile: string;
  readonly entry: HostEntry;
}

export type RunContext = {
  readonly v: 1;
  readonly workspace: string;
  readonly agentDeviceSession: string;
  readonly targets: readonly RunTarget[];
  readonly e2eVideo: boolean;
} & (
  | { readonly run: RunId; readonly broker: { readonly url: string; readonly tokenFile: string } }
  | { readonly run: null; readonly broker: null }
);
export type ActiveRunContext = Extract<RunContext, { readonly run: RunId }>;

export interface E2EInvocation {
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
}

export interface BrokerLaunchRequest {
  readonly platform: Platform;
  readonly instance: InstanceName;
  readonly user: SeededUser | null;
  readonly screen: string | null;
  readonly authMode: AuthMode | null;
  readonly debugLogs: boolean;
  readonly storageScope: StorageScope | null;
}
export interface BrokerLaunchResponse {
  readonly launchId: LaunchId;
  readonly storageScope: StorageScope;
  readonly launchArguments: readonly string[];
}

/** How long a verb waits for the device lock, and the fix it prints when it gives up. The fix names only flags that verb takes. */
export interface DeviceWait {
  readonly seconds: number;
  readonly busyFix: string;
  readonly onWait?: (owner: ProcessRef) => void;
}

export interface AcquireRequest {
  readonly platform: Platform;
  readonly worktree: string;
  readonly waitSeconds: number;
  /** The calling verb's own command with a wait flag, for the POOL_FULL fix. */
  readonly retryWith: string;
  readonly progress: (line: string) => void;
}

export interface ProcessRef {
  readonly pid: number;
  readonly startedAt: number;
}

export interface Recording {
  readonly process: ProcessRef;
  stop(): Promise<EvidencePath>;
}

export interface AgentDeviceTarget {
  readonly daemon: 'local';
  readonly deviceId: string;
}

export interface DeviceBackend<L extends Lease = Lease> {
  readonly kind: BackendKind;
  readonly platform: Platform;
  supports(os: NodeJS.Platform): boolean;
  acquire(request: AcquireRequest): Promise<L>;
  check(lease: L): Promise<'held' | 'lost' | 'expiring'>;
  install(lease: L, app: BuiltApp): Promise<void>;
  release(lease: L): Promise<void>;
  /**
   * Devices whose machine-wide claim has a dead process and a missing worktree, plus, when `owner` is given,
   * every device claimed for that worktree (what `down --stale` finishes after a crashed acquire).
   */
  reapable(owner?: string): Promise<readonly L[]>;
  startRecording(lease: L, into: EvidencePath): Promise<Recording | 'e2e-records'>;
  logs(lease: L, since: Date, extraPredicate?: string): Promise<string>;
  agentDeviceTarget(lease: L): AgentDeviceTarget;
  describe(lease: L): string;
  /** What the machine needs for this backend, for fix text, e.g. 'a Mac with Xcode'. */
  readonly requirement: string;
  /** Read-only readiness checks. `toolchain` checks print right after Node; `device` checks after the agent-device versions. */
  doctorChecks(): Promise<{ readonly toolchain: readonly DoctorCheck[]; readonly device: readonly DoctorCheck[] }>;
}

export const LOCAL_POOL: Readonly<Record<Platform, number>> = { ios: 4, android: 2 };

export interface HostAdapter<S extends string = string> {
  readonly repo: 'clerk-ios' | 'clerk-android' | 'clerk-expo';
  readonly platforms: readonly Platform[];
  readonly screens: readonly S[];
  readonly keysFile: string;
  readonly githubRepo: string;
  appId(platform: Platform): string;
  buildInputs(platform: Platform): readonly string[];
  buildSources(platform: Platform, os: NodeJS.Platform): readonly BuildSource[];
  build(platform: Platform, source: BuildSource, key: BuildKey, into: ScratchPath, progress: (line: string) => void): Promise<BuiltApp>;
  entry(platform: Platform): HostEntry;
  /**
   * Starts or reuses what the host needs beside the app while a lease is held, such as Metro for an Expo dev client.
   * Must be idempotent: called on every up and run, it reuses a live process instead of starting a second one.
   */
  runtime?(lease: Lease): Promise<HostRuntime>;
  /** Extra log filter clauses ORed into the backend's own, such as the subsystem React Native logs under on iOS. */
  readonly logPredicates?: Readonly<Partial<Record<Platform, string>>>;
  readonly features: readonly string[];
  readonly backends: readonly DeviceBackend[];
}
