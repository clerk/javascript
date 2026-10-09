import type { Brand, Platform, RunId, TestEmail } from '../../specs/support/types.ts';

export type {
  AppEntry,
  AppLocators,
  AuthMode,
  Brand,
  HostFixture,
  HostLaunch,
  LaunchId,
  LaunchOptions,
  Platform,
  PublishableKey,
  RunId,
  SecretLike,
  SecretSink,
  SeedOptions,
  SeededUser,
  StorageScope,
  TestEmail,
  TestPhone,
} from '../../specs/support/types.ts';

export const CLI_PLACEHOLDER = '{cli}';

export type AcquireLock = Brand<{ readonly platform: Platform }, 'AcquireLock'>;

export type BuildKey = Brand<string, 'BuildKey'>;
export type FeatureName = Brand<string, 'FeatureName'>;
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

export type BackendKind = 'local' | 'remote';
export type RemoteProvider = 'github-actions';

export type SpecSelection = { readonly all: true } | { readonly selectors: readonly string[] };

export type Command =
  | { readonly verb: 'doctor'; readonly platform?: Platform; readonly backend?: BackendKind; readonly runner?: string; readonly live: boolean }
  | { readonly verb: 'up'; readonly platform?: Platform; readonly backend?: BackendKind; readonly runner?: string; readonly waitSeconds: number }
  | {
      readonly verb: 'run';
      readonly selection: SpecSelection;
      readonly platform?: Platform;
      readonly backend?: BackendKind;
      readonly runner?: string;
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
  | 'backend' | 'remote-env' | 'git-fetch' | 'git-push' | 'github-rest' | 'remote-commit' | 'tunnel-egress' | 'clerk-egress' | 'remote-sessions'
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

export interface EvidenceSummary {
  readonly run: RunId;
  readonly platform: Platform;
  readonly device: string;
  readonly commit: string;
  readonly passed: number;
  readonly flaky: number;
  readonly total: number;
}

export interface EvidenceBundle {
  readonly pr: number;
  readonly summary: EvidenceSummary;
  readonly files: readonly { readonly name: string; readonly path: EvidencePath }[];
}

export interface HandOffReceipt {
  readonly sessionRun: string;
  readonly sessionRunUrl: string;
}

export type AttachResult =
  | { readonly verb: 'attach'; readonly via: 'gh'; readonly prUrl: string; readonly posted: readonly EvidencePath[]; readonly alreadyPosted: boolean }
  | ({ readonly verb: 'attach'; readonly via: 'runner'; readonly pr: number; readonly handedOff: readonly EvidencePath[]; readonly because: string } & HandOffReceipt);

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
export interface SessionBuild extends BuiltAppBase {
  readonly source: 'github-actions';
  readonly path: null;
  readonly sourceSha: string;
}
export type BuiltApp = LocalBuild | SessionBuild;
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
export interface RemoteLease extends LeaseBase {
  readonly backend: 'remote';
  readonly provider: RemoteProvider;
  readonly session: string;
  readonly providerRef: string;
  readonly baseUrl: string;
  readonly tokenFile: string;
  readonly deviceId: string;
  readonly deviceName: string;
  readonly runner: string;
  readonly expiresAt: string;
  readonly builtSha: string | null;
}
export type Lease = LocalLease | RemoteLease;

export type LedgerEntry =
  | { readonly id: string; readonly kind: 'lease-intent'; readonly platform: Platform; readonly backend: BackendKind; readonly worktree: string }
  | { readonly id: string; readonly kind: 'lease-held'; readonly platform: Platform; readonly backend: BackendKind; readonly sessionId: string | null; readonly deviceId: string | null }
  | { readonly id: string; readonly kind: 'application'; readonly name: string; readonly workspace: string }
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
  readonly remote: { readonly provider: RemoteProvider; readonly runner: string; readonly builtSha: string | null } | null;
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

export interface RuntimeProcess {
  readonly what: 'metro' | 'watch';
  readonly pid: number;
  readonly startedAt: number;
  readonly platform?: Platform;
}

export interface HostRuntime {
  readonly devServer: string | null;
  readonly processes: readonly RuntimeProcess[];
}

export interface E2EInvocation {
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string>>;
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
  readonly runner?: string;
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
  readonly runner?: string;
  readonly worktree: string;
  readonly progress: (line: string) => void;
}

export interface DeviceBackend<L extends Lease = Lease> {
  readonly kind: BackendKind;
  readonly platform: Platform;
  availability(): Availability;
  sourceCommit?(input: { readonly worktree: string; readonly inputs: readonly string[] }): Promise<string>;
  acquire(request: AcquireRequest): Promise<L>;
  check(lease: L): Promise<'held' | 'lost' | 'expiring'>;
  install(lease: L, app: BuiltApp, progress: (line: string) => void): Promise<L>;
  release(lease: L): Promise<void>;
  reapable(owner?: string): Promise<readonly L[]>;
  startRecording(lease: L, into: EvidencePath): Promise<Recording>;
  logs(lease: L, since: Date, extraPredicate?: string): Promise<string>;
  handOffEvidence?(lease: L, bundle: EvidenceBundle, progress: (line: string) => void): Promise<HandOffReceipt>;
  describe(lease: L): string;
  readonly requirement: string;
  doctorChecks(options: DoctorOptions): Promise<{ readonly toolchain: readonly DoctorCheck[]; readonly device: readonly DoctorCheck[] }>;
}

export const LOCAL_POOL: Readonly<Record<Platform, number>> = { ios: 4, android: 2 };

export interface HostAdapter {
  readonly repo: 'clerk-ios' | 'clerk-android' | 'clerk-expo';
  readonly cli: string;
  readonly platforms: readonly Platform[];
  readonly githubRepo: string;
  appId(platform: Platform): string;
  buildInputs(platform: Platform, backend: BackendKind): readonly string[];
  build(platform: Platform, key: BuildKey, into: ScratchPath, progress: (line: string) => void): Promise<BuiltApp>;
  readonly logPredicates?: Readonly<Partial<Record<Platform, string>>>;
  readonly backends: readonly DeviceBackend[];
  runtime?(lease: Lease, progress: (line: string) => void): Promise<HostRuntime>;
}
