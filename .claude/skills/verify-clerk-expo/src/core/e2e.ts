import { spawn } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { agentEnvironment, type Agent } from './agent.ts';
import { withoutClerkKeys } from './keys.ts';
import { redact } from './secret.ts';
import { agentDeviceStateDir } from './workspace.ts';
import {
  VerifyFailure,
  type ActiveRunContext,
  type E2EInvocation,
  type EvidencePath,
  type FeatureName,
  type Platform,
  type RunCommand,
  type RunContext,
  type SpecRef,
  type SpecResult,
  type SpecSelection,
  type SpecStatus,
} from './types.ts';

const SPEC_SUFFIX = '.e2e.ts';

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : entry.name.endsWith(SPEC_SUFFIX) ? [path] : [];
  });
}

const toPosix = (path: string) => path.split(sep).join('/');

function specRef(skillDir: string, absolute: string): SpecRef | null {
  const path = toPosix(relative(skillDir, absolute));
  const golden = /^specs\/golden\/([^/]+)\/.+\.e2e\.ts$/.exec(path);
  if (golden !== null) return { kind: 'golden', path, feature: golden[1] as FeatureName };
  if (/^specs\/explored\/.+\.e2e\.ts$/.test(path)) return { kind: 'explored', path, feature: null };
  return null;
}

export function resolveSpecs(skillDir: string, selection: SpecSelection, cwd: string = process.cwd()): readonly SpecRef[] {
  const goldenDir = join(skillDir, 'specs', 'golden');
  const features = existsSync(goldenDir) ? readdirSync(goldenDir).filter((name) => statSync(join(goldenDir, name)).isDirectory()).sort() : [];
  const toRefs = (paths: readonly string[]) => paths.flatMap((p) => specRef(skillDir, p) ?? []).sort((a, b) => a.path.localeCompare(b.path));

  if ('all' in selection) {
    const refs = toRefs(walk(goldenDir));
    if (refs.length === 0) throw new VerifyFailure('NO_SPECS', 'there are no golden specs under specs/golden/', 'write one under specs/golden/<feature>/, or run an explored spec by path');
    return refs;
  }

  const found = new Map<string, SpecRef>();
  for (const selector of selection.selectors) {
    let refs: readonly SpecRef[] = [];
    if (selector.endsWith(SPEC_SUFFIX)) {
      const candidates = isAbsolute(selector) ? [selector] : [resolve(cwd, selector), resolve(skillDir, selector)];
      const file = candidates.find((c) => existsSync(c));
      if (file !== undefined) {
        const ref = specRef(skillDir, file);
        if (ref === null) throw new VerifyFailure('NO_SPECS', `${selector} is not under specs/golden/<feature>/ or specs/explored/`, 'move the spec under specs/explored/ and run it by that path');
        refs = [ref];
      }
    } else if (selector.includes('/')) {
      const [feature, spec] = selector.split('/', 2);
      const file = join(goldenDir, feature ?? '', `${(spec ?? '').replace(/\.e2e\.ts$/, '')}${SPEC_SUFFIX}`);
      if (existsSync(file)) refs = toRefs([file]);
    } else if (features.includes(selector)) {
      refs = toRefs(walk(join(goldenDir, selector)));
    }
    if (refs.length === 0) {
      throw new VerifyFailure(
        'NO_SPECS',
        `no specs match ${selector}`,
        features.length > 0 ? `name a feature (${features.join(', ')}), one of its specs as <feature>/<spec>, or a path to a .e2e.ts file under specs/explored/` : 'pass a path to a .e2e.ts file under specs/explored/',
      );
    }
    for (const ref of refs) found.set(ref.path, ref);
  }
  return [...found.values()];
}

export function contextFile(context: ActiveRunContext): string {
  return join(context.workspace, 'scratch', context.run, 'context.json');
}

export function writeRunContext(file: string, context: RunContext): void {
  writeFileSync(file, `${JSON.stringify(context, null, 2)}\n`, { mode: 0o600 });
}

export function e2eOutputDir(runDir: EvidencePath, index: number): EvidencePath {
  return join(runDir, index === 0 ? 'e2e' : `e2e-${index + 1}`) as EvidencePath;
}

export function planE2E(
  context: ActiveRunContext,
  specs: readonly SpecRef[],
  command: RunCommand,
  platform: Platform,
  skillDir: string,
  outputDir: EvidencePath,
): E2EInvocation {
  const output = toPosix(relative(skillDir, outputDir));
  const args = [
    'run',
    ...specs.map((s) => s.path),
    '--config',
    'e2e.config.ts',
    '--target',
    platform,
    '--output',
    output,
    '--reporter',
    'list,markdown,junit',
    '--retries',
    String(command.retries),
    ...(command.grep === undefined ? [] : ['--grep', command.grep]),
    '--pass-with-no-tests',
  ];
  return { args, env: { VERIFY_CONTEXT: contextFile(context), AGENT_DEVICE_STATE_DIR: agentDeviceStateDir(context.workspace), E2E_TELEMETRY_DISABLED: '1' } };
}

export async function invokeE2E(invocation: E2EInvocation, log: EvidencePath, skillDir: string, onLine: (line: string) => void, agent: Agent | null): Promise<{ readonly exitCode: number }> {
  const bin = join(skillDir, 'node_modules', '.bin', 'e2e');
  if (!existsSync(bin)) throw new VerifyFailure('NOT_READY', 'the pinned e2e is not installed', `cd ${skillDir} && npm ci`);
  return new Promise((resolvePromise) => {
    const child = spawn(bin, [...invocation.args], {
      cwd: skillDir,
      env: { ...withoutClerkKeys(process.env), ...invocation.env, ...agentEnvironment(agent), NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const pipe = (stream: NodeJS.ReadableStream) => {
      let buffered = '';
      const flush = (line: string) => {
        const safe = redact(line);
        appendFileSync(log, `${safe}\n`);
        onLine(safe);
      };
      stream.on('data', (chunk: Buffer) => {
        buffered += chunk.toString();
        const lines = buffered.split('\n');
        buffered = lines.pop() ?? '';
        lines.forEach(flush);
      });
      stream.on('end', () => {
        if (buffered.length > 0) flush(buffered);
      });
    };
    pipe(child.stdout);
    pipe(child.stderr);
    child.on('error', () => resolvePromise({ exitCode: 127 }));
    child.on('close', (code) => resolvePromise({ exitCode: code ?? 1 }));
  });
}

interface WireError {
  readonly message?: string;
}
interface WireArtifact {
  readonly id?: string;
  readonly kind?: string;
  readonly path?: string;
  readonly producer?: { readonly kind?: string; readonly stepId?: string };
}
interface WireStep {
  readonly id?: string;
  readonly api?: string;
  readonly label?: string;
}
interface WireAttempt {
  readonly status?: string;
  readonly durationMs?: number;
  readonly error?: WireError;
  readonly failure?: { readonly screen?: string; readonly screenshot?: string };
  readonly artifacts?: readonly WireArtifact[];
  readonly steps?: readonly WireStep[];
}
interface WireResult {
  readonly id?: string;
  readonly kind?: string;
  readonly titlePath?: readonly string[];
  readonly file?: string;
  readonly platform?: string;
  readonly tags?: readonly string[];
  readonly status?: string;
  readonly skip?: { readonly cause?: string; readonly reason?: string };
  readonly attempts?: readonly WireAttempt[];
}

function wireResults(reportJson: unknown): readonly WireResult[] {
  const report = reportJson as { schemaVersion?: unknown; run?: { results?: unknown } } | null;
  if (report?.schemaVersion !== 'report-1' || !Array.isArray(report.run?.results)) {
    throw new VerifyFailure('E2E_CRASHED', 'e2e wrote a report this skill cannot read (expected schemaVersion report-1)', 'check e2e-pins with `{cli} doctor`');
  }
  return report.run.results as WireResult[];
}

const STATUS: Readonly<Record<string, SpecStatus>> = {
  passed: 'passed',
  failed: 'failed',
  'timed-out': 'failed',
  flaky: 'flaky',
  interrupted: 'interrupted',
  skipped: 'skipped',
};

function platformSkip(reason: string | undefined): string {
  const declared = /platforms \[([^\]]*)\]/.exec(reason ?? '')?.[1];
  return declared === undefined ? `skipped: ${reason ?? 'other platform'}` : `skipped: ${declared.split(/,\s*/).join(' and ')} only`;
}

export function parseE2EReport(reportJson: unknown, specs: readonly SpecRef[], outputDir: EvidencePath): readonly SpecResult[] {
  const failuresDir = join(outputDir, 'failures');
  const pages = existsSync(failuresDir) ? readdirSync(failuresDir) : [];
  const selected = new Set(specs.map((s) => s.path));
  return wireResults(reportJson)
    .filter((r) => (r.kind === 'test' || r.kind === 'setup') && selected.has(r.file ?? ''))
    .map((r): SpecResult => {
      const file = r.file ?? '';
      const spec = specs.find((s) => s.path === file)!;
      const attempts = r.attempts ?? [];
      const shown = attempts.findLast((attempt) => attempt.error !== undefined) ?? attempts.at(-1);
      const notRun = r.status === 'skipped' && r.skip?.cause !== 'filtered' && r.skip?.cause !== 'platform-unavailable';
      const status = notRun ? 'failed' : (STATUS[r.status ?? ''] ?? 'failed');
      const page = r.id === undefined ? undefined : pages.find((p) => p.endsWith(`-${r.id!.slice(0, 8)}.md`));
      const artifactPath = (id: string | undefined): EvidencePath | null => {
        const path = id === undefined ? undefined : shown?.artifacts?.find((a) => a.id === id)?.path;
        return path === undefined ? null : (join(outputDir, 'artifacts', path) as EvidencePath);
      };
      const screenPath = artifactPath(shown?.failure?.screen);
      let skipReason: string | null = null;
      let skippedBy: SpecResult['skippedBy'] = null;
      if (status === 'skipped') {
        if (r.skip?.cause === 'platform-unavailable') skippedBy = 'platform';
        skipReason = r.skip?.cause === 'platform-unavailable' ? platformSkip(r.skip.reason) : `${r.skip?.cause ?? 'skipped'}: ${r.skip?.reason ?? ''}`.trim();
      }
      const message = notRun ? `not run: ${r.skip?.cause ?? 'skipped'} ${r.skip?.reason ?? ''}`.trim() : shown?.error?.message;
      return {
        spec,
        title: (r.titlePath ?? []).join(' > '),
        platform: r.platform === 'android' ? 'android' : 'ios',
        status,
        seconds: Math.round(attempts.reduce((sum, a) => sum + (a.durationMs ?? 0), 0) / 100) / 10,
        attempts: attempts.length,
        error: message === undefined ? null : redact(message.split('\n').filter((line) => line.trim().length > 0).join('; ')),
        skipReason,
        skippedBy,
        tags: r.tags ?? [],
        failurePage: page === undefined ? null : (join(failuresDir, page) as EvidencePath),
        failureScreen: screenPath !== null && existsSync(screenPath) ? (screenPath as EvidencePath) : null,
        failureScreenshot: artifactPath(shown?.failure?.screenshot),
      };
    });
}

export function collectScreenshots(reportJson: unknown, runDir: EvidencePath, outputDir: EvidencePath): readonly { readonly label: string; readonly path: EvidencePath }[] {
  const out = new Map<string, EvidencePath>();
  const dir = join(runDir, 'screenshots');
  for (const result of wireResults(reportJson)) {
    for (const attempt of result.attempts ?? []) {
      const steps = new Map((attempt.steps ?? []).map((s) => [s.id, s]));
      for (const artifact of attempt.artifacts ?? []) {
        if (artifact.kind !== 'screenshot' || artifact.path === undefined) continue;
        const step = artifact.producer?.stepId === undefined ? undefined : steps.get(artifact.producer.stepId);
        if (step?.api !== 'app.screenshot' || !step.label) continue;
        const source = join(outputDir, 'artifacts', artifact.path);
        if (!existsSync(source)) continue;
        const label = step.label.replace(/[^A-Za-z0-9._-]/g, '-');
        mkdirSync(dir, { recursive: true });
        const target = join(dir, `${label}.png`) as EvidencePath;
        copyFileSync(source, target);
        out.set(label, target);
      }
    }
  }
  return [...out].map(([label, path]) => ({ label, path }));
}

export function assertSomethingRan(results: readonly SpecResult[], selection: string): 'ran' | 'all-left-out' {
  if (results.some((r) => r.status !== 'skipped')) return 'ran';
  if (results.some((r) => r.skippedBy !== null)) return 'all-left-out';
  const reasons = [...new Set(results.map((r) => r.skipReason).filter((x): x is string => x !== null))];
  throw new VerifyFailure(
    'NO_SPECS',
    `no test ran for ${selection}${reasons.length === 0 ? ': the selection registered no tests' : `: ${reasons.join('; ')}`}`,
    'check the --grep pattern and the spec files; {cli} run <feature> runs every test in it',
  );
}
