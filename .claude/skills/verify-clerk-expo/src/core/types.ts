import type { Locator } from 'e2e';

declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export const HOST_CONTRACT_VERSION = 1 as const;

export const CLI_PLACEHOLDER = '{cli}';

export type Platform = 'ios' | 'android';

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

export type Json = null | boolean | number | string | readonly Json[] | { readonly [key: string]: Json };

export interface InstanceSettings {
  readonly config: { readonly [key: string]: Json };
  readonly environment: { readonly [leaf: string]: Json };
}

export interface InstanceView {
  readonly id: string;
  readonly name: string;
  readonly created: boolean;
  readonly settings: string;
}

export interface ApplicationView {
  readonly name: string;
}

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

export interface HostLaunch {
  readonly verifyPublishableKey: PublishableKey;
  readonly verifyRunId: RunId;
  readonly verifyStorageScope: StorageScope;
  readonly verifyLaunchId: LaunchId;
  readonly verifyScreen?: string;
  readonly verifyAuthMode?: AuthMode;
  readonly verifySignInTicket?: SecretLike;
  readonly verifyLogLevel?: 'debug';
}

export interface SecretLike {
  readonly name: string;
  use<T>(sink: SecretSink, fn: (plain: string) => T): T;
}

export type SecretSink = 'bapi-authorization' | 'launch-argument' | 'platform-authorization' | 'instance-keys-file' | 'one-password-read';

export type BackendKind = 'local';
export type OptInTag = 'form-entry' | 'known-bug';
export const FORM_ENTRY_TAG = 'form-entry' satisfies OptInTag;
export const KNOWN_BUG_TAG = 'known-bug' satisfies OptInTag;

export type SpecSelection = { readonly all: true } | { readonly selectors: readonly string[] };

export type Command =
  | { readonly verb: 'doctor'; readonly platform?: Platform; readonly live: boolean }
  | { readonly verb: 'up'; readonly platform?: Platform; readonly waitSeconds: number }
  | {
      readonly verb: 'run';
      readonly selection: SpecSelection;
      readonly platform?: Platform;
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
  | 'UNSUPPORTED'
  | 'RATE_LIMITED';

export const RETRYABLE: ReadonlySet<ErrorCode> = new Set<ErrorCode>(['POOL_FULL', 'DEVICE_BUSY', 'LEASE_LOST', 'RATE_LIMITED']);

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
  | 'node' | 'xcode' | 'jdk' | 'e2e-pins' | 'template' | 'proxy-trust'
  | 'settings' | 'build' | 'gh-attach' | 'core-drift' | 'stale-claims' | 'feature-map' | 'agent-device-daemon' | 'lane-ports'
  | 'instances' | 'clerk-api'
  | 'live-instance';

interface DoctorCheckBase {
  readonly id: DoctorCheckId;
  readonly detail: string;
  readonly fix?: string;
}
export type DoctorCheck =
  | (DoctorCheckBase & { readonly ok: boolean; readonly state?: undefined })
  | (DoctorCheckBase & { readonly ok: true; readonly state: 'warning' | 'not-run' });

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
  readonly instances: readonly InstanceView[];
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
      readonly deletedApplications: readonly ApplicationView[];
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

export interface DeletionTarget {
  readonly kind: 'application';
  readonly name: string;
}

export type VerbResult = DoctorReport | UpResult | RunResult | ScreenResult | AttachResult | DownResult;

export type SpecKind = 'golden' | 'explored';
export interface SpecRef {
  readonly kind: SpecKind;
  readonly path: string;
  readonly feature: FeatureName | null;
}

export type BuildSource = 'local';

export interface BuiltApp {
  readonly platform: Platform;
  readonly key: BuildKey;
  readonly appId: string;
  readonly path: ScratchPath;
  readonly source: BuildSource;
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
export type Lease = LocalLease;

export interface SeededUser {
  readonly id: string;
  readonly email: TestEmail;
  readonly phone: TestPhone | null;
}

export type LedgerEntry =
  | { readonly id: string; readonly kind: 'lease-intent'; readonly platform: Platform; readonly backend: BackendKind; readonly worktree: string }
  | { readonly id: string; readonly kind: 'lease-held'; readonly platform: Platform; readonly backend: BackendKind; readonly deviceId: string | null }
  | { readonly id: string; readonly kind: 'application'; readonly name: string; readonly workspace: string }
  | { readonly id: string; readonly kind: 'identity'; readonly run: RunId; readonly email: TestEmail }
  | { readonly id: string; readonly kind: 'user'; readonly run: RunId; readonly userId: string; readonly email: TestEmail }
  | { readonly id: string; readonly kind: 'process'; readonly what: 'metro' | 'watch' | 'recorder' | 'agent-device'; readonly pid: number; readonly startedAt: string; readonly platform?: Platform }
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
  readonly instances: readonly { readonly application: string }[];
  readonly settings: readonly {
    readonly label: string;
    readonly askedBy: string | null;
    readonly specs: readonly string[];
    readonly application: string | null;
    readonly changed: boolean;
    readonly held: boolean;
    readonly e2eReport: EvidencePath | null;
  }[];
  readonly tainted: readonly EvidencePath[];
  readonly sealed: true;
}

export interface LaunchOptions<S extends string = string> {
  readonly screen?: S;
  readonly authMode?: AuthMode;
  readonly debugLogs?: boolean;
  readonly keepStorage?: boolean;
  readonly signedInAs?: SeededUser;
}

export interface HostFixture<S extends string = string> {
  newEmail(): Promise<TestEmail>;
  seedUser(options?: { readonly phone?: boolean }): Promise<SeededUser>;
  launch(options: LaunchOptions<S>): Promise<VerifyState>;
  state(): Promise<VerifyState>;
  waitForState(predicate: (state: VerifyState) => boolean, timeoutMs?: number): Promise<VerifyState>;
  screenshot(label: string): Promise<void>;
  tap(target: Locator): Promise<void>;
  fill(target: Locator, text: string): Promise<void>;
}

export const CLERK_TEST_CODE = '424242' as const;

export type HostEntry =
  | { readonly kind: 'binary' }
  | {
      readonly kind: 'dev-client';
      readonly launchArguments: readonly string[];
      readonly openLink: string | null;
      readonly androidActivity: string | null;
    };

export interface RuntimeProcess {
  readonly what: 'metro' | 'watch';
  readonly pid: number;
  readonly startedAt: number;
  readonly platform?: Platform;
}

export interface HostRuntime {
  readonly entry: HostEntry;
  readonly processes: readonly RuntimeProcess[];
}

export interface RunTarget {
  readonly platform: Platform;
  readonly appId: string;
  readonly appPath: string;
  readonly leaseFile: string;
  readonly entry: HostEntry;
}

export type RunContext = {
  readonly v: 1;
  readonly workspace: string;
  readonly agentDeviceSession: string;
  readonly targets: readonly RunTarget[];
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

export interface DeviceWait {
  readonly seconds: number;
  readonly busyFix: string;
  readonly onWait?: (owner: ProcessRef) => void;
}

export interface AcquireRequest {
  readonly platform: Platform;
  readonly worktree: string;
  readonly waitSeconds: number;
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

export interface Availability {
  readonly usable: boolean;
  readonly why: string;
}

export interface DeviceBackend<L extends Lease = Lease> {
  readonly kind: BackendKind;
  readonly platform: Platform;
  availability(): Availability;
  acquire(request: AcquireRequest): Promise<L>;
  check(lease: L): Promise<'held' | 'lost'>;
  install(lease: L, app: BuiltApp): Promise<L>;
  release(lease: L): Promise<void>;
  reapable(owner?: string): Promise<readonly L[]>;
  startRecording(lease: L, into: EvidencePath): Promise<Recording>;
  logs(lease: L, since: Date, extraPredicate?: string): Promise<string>;
  describe(lease: L): string;
  readonly requirement: string;
  doctorChecks(): Promise<{ readonly toolchain: readonly DoctorCheck[]; readonly device: readonly DoctorCheck[] }>;
}

export const LOCAL_POOL: Readonly<Record<Platform, number>> = { ios: 4, android: 2 };

interface HostBase<S extends string> {
  readonly repo: 'clerk-ios' | 'clerk-android' | 'clerk-expo';
  readonly cli: string;
  readonly platforms: readonly Platform[];
  readonly screens: readonly S[];
  readonly githubRepo: string;
  appId(platform: Platform): string;
  buildInputs(platform: Platform): readonly string[];
  build(platform: Platform, key: BuildKey, into: ScratchPath, progress: (line: string) => void): Promise<BuiltApp>;
  readonly logPredicates?: Readonly<Partial<Record<Platform, string>>>;
  readonly features: readonly string[];
  readonly backends: readonly DeviceBackend[];
}

interface HostWithFixedEntry {
  entry(platform: Platform): HostEntry;
  readonly runtime?: undefined;
}

interface HostWithRuntime {
  runtime(lease: Lease, progress: (line: string) => void): Promise<HostRuntime>;
  readonly entry?: undefined;
}

export type HostAdapter<S extends string = string> = HostBase<S> & (HostWithFixedEntry | HostWithRuntime);
