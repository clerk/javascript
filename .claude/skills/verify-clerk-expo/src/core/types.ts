import type { Locator } from 'e2e';

declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export const CLI_PLACEHOLDER = '{cli}';

export type Platform = 'ios' | 'android';

export type AcquireLock = Brand<{ readonly platform: Platform }, 'AcquireLock'>;

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

export interface SecretLike {
  readonly name: string;
  use<T>(sink: SecretSink, fn: (plain: string) => T): T;
}

export type SecretSink = 'bapi-authorization' | 'launch-argument' | 'platform-authorization' | 'one-password-read' | 'bapi-user-password' | 'broker-response' | 'device-input' | 'gateway-provider' | 'e2e-agent-environment';

export type BackendKind = 'local';

export type SpecSelection = { readonly all: true } | { readonly selectors: readonly string[] };

export type Command =
  | { readonly verb: 'doctor'; readonly platform?: Platform; readonly backend?: BackendKind; readonly live: boolean }
  | { readonly verb: 'up'; readonly platform?: Platform; readonly backend?: BackendKind; readonly waitSeconds: number }
  | {
      readonly verb: 'run';
      readonly selection: SpecSelection;
      readonly platform?: Platform;
      readonly backend?: BackendKind;
      readonly grep?: string;
      readonly video: boolean;
      readonly retries: number;
      readonly githubReport: boolean;
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
  | 'settings' | 'build' | 'gh-attach' | 'core-drift' | 'stale-claims' | 'lane-ports'
  | 'instances' | 'clerk-api' | 'agent'
  | 'backend'
  | `live-${string}`;

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

interface BuiltAppBase {
  readonly platform: Platform;
  readonly key: BuildKey;
  readonly appId: string;
}
export interface LocalBuild extends BuiltAppBase {
  readonly source: 'local';
  readonly path: ScratchPath;
}
export type BuiltApp = LocalBuild;
export type BuildSource = BuiltApp['source'];

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
  readonly password: SecretLike | null;
}

export interface SeedOptions {
  readonly phone?: boolean;
  readonly password?: boolean;
}

export type LedgerEntry =
  | { readonly id: string; readonly kind: 'lease-intent'; readonly platform: Platform; readonly backend: BackendKind; readonly worktree: string }
  | { readonly id: string; readonly kind: 'lease-held'; readonly platform: Platform; readonly backend: BackendKind; readonly sessionId: string | null; readonly deviceId: string | null }
  | { readonly id: string; readonly kind: 'application'; readonly name: string; readonly workspace: string }
  | { readonly id: string; readonly kind: 'identity'; readonly run: RunId; readonly email: TestEmail }
  | { readonly id: string; readonly kind: 'phone'; readonly run: RunId; readonly phone: TestPhone }
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
  readonly attempts: number;
  readonly error: string | null;
  readonly skipReason: string | null;
  readonly skippedBy: 'platform' | null;
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
  readonly appLog: EvidencePath | null;
  readonly e2eReport: EvidencePath;
  readonly identities: readonly { readonly email: TestEmail; readonly userId: string | null }[];
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
  readonly appPath: string | null;
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

export type BrokerSeedRequest = Required<SeedOptions>;
export type BrokerSeedResponse = Omit<SeededUser, 'password'> & { readonly password: string | null };

export interface BrokerLaunchRequest {
  readonly platform: Platform;
  readonly user: SeededUser | null;
  readonly authMode: AuthMode | null;
  readonly initialIdentifier: string | null;
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
  readonly app: BuiltApp;
  readonly retryWith: string;
  readonly progress: (line: string) => void;
}

export interface ProcessRef {
  readonly pid: number;
  readonly startedAt: number;
}

export interface Recording {
  readonly process: ProcessRef | null;
  stop(): Promise<EvidencePath>;
}

export interface Availability {
  readonly usable: boolean;
  readonly why: string;
  readonly fix?: string;
}

export interface DoctorOptions {
  readonly live: boolean;
  readonly worktree: string;
  readonly progress: (line: string) => void;
}

export interface DeviceBackend<L extends Lease = Lease> {
  readonly kind: BackendKind;
  readonly platform: Platform;
  availability(): Availability;
  acquire(request: AcquireRequest): Promise<L>;
  check(lease: L): Promise<'held' | 'lost'>;
  install(lease: L, app: BuiltApp, progress: (line: string) => void): Promise<L>;
  release(lease: L): Promise<void>;
  reapable(owner?: string): Promise<readonly L[]>;
  startRecording(lease: L, into: EvidencePath): Promise<Recording>;
  logs(lease: L, since: Date, extraPredicate?: string): Promise<string>;
  describe(lease: L): string;
  readonly requirement: string;
  doctorChecks(options: DoctorOptions): Promise<{ readonly toolchain: readonly DoctorCheck[]; readonly device: readonly DoctorCheck[] }>;
}

export const LOCAL_POOL: Readonly<Record<Platform, number>> = { ios: 4, android: 2 };

interface HostBase {
  readonly repo: 'clerk-ios' | 'clerk-android' | 'clerk-expo';
  readonly cli: string;
  readonly platforms: readonly Platform[];
  readonly githubRepo: string;
  appId(platform: Platform): string;
  buildInputs(platform: Platform, backend: BackendKind): readonly string[];
  build(platform: Platform, key: BuildKey, into: ScratchPath, progress: (line: string) => void): Promise<BuiltApp>;
  readonly logPredicates?: Readonly<Partial<Record<Platform, string>>>;
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

export type HostAdapter = HostBase & (HostWithFixedEntry | HostWithRuntime);
