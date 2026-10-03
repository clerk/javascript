import { spawn } from 'node:child_process';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { redact } from './secret.ts';
import { agentDeviceStateDir } from './workspace.ts';
import {
  FORM_ENTRY_TAG,
  KNOWN_BUG_TAG,
  type OptInTag,
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

export function specRef(skillDir: string, absolute: string): SpecRef | null {
  const path = toPosix(relative(skillDir, absolute));
  const golden = /^specs\/golden\/([^/]+)\/.+\.e2e\.ts$/.exec(path);
  if (golden !== null) return { kind: 'golden', path, feature: golden[1] as FeatureName };
  if (/^specs\/explored\/.+\.e2e\.ts$/.test(path)) return { kind: 'explored', path, feature: null };
  return null;
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}

export function resolveSpecs(skillDir: string, selection: SpecSelection, cwd: string = process.cwd()): readonly SpecRef[] {
  const goldenDir = join(skillDir, 'specs', 'golden');
  const features = existsSync(goldenDir) ? readdirSync(goldenDir).filter((name) => statSync(join(goldenDir, name)).isDirectory()) : [];
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
      const nearest = [...features].sort((a, b) => levenshtein(selector, a) - levenshtein(selector, b)).slice(0, 3);
      throw new VerifyFailure(
        'NO_SPECS',
        `no specs match ${selector}`,
        nearest.length > 0 ? `try one of: ${nearest.join(', ')}` : 'pass a path to a .e2e.ts file under specs/explored/',
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

export function e2eOutputDir(skillDir: string, runDir: EvidencePath): string {
  return toPosix(relative(skillDir, join(runDir, 'e2e')));
}

export function excludedTagNames(command: Pick<RunCommand, 'skip' | 'include'>): readonly OptInTag[] {
  return [...new Set<OptInTag>([...command.skip, KNOWN_BUG_TAG])].filter((tag) => !command.include.includes(tag));
}

export function excludedTags(command: Pick<RunCommand, 'skip' | 'include'>): readonly string[] {
  const tags = excludedTagNames(command);
  return tags.length === 0 ? [] : ['--exclude-tag', tags.join(',')];
}

export function planE2E(
  context: ActiveRunContext,
  specs: readonly SpecRef[],
  command: RunCommand,
  platform: Platform,
  skillDir: string,
): E2EInvocation {
  const output = toPosix(relative(skillDir, join(context.workspace, 'runs', context.run, 'e2e')));
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
    'list,markdown',
    ...excludedTags(command),
    ...(command.grep === undefined ? [] : ['--grep', command.grep]),
    ...(context.e2eVideo ? ['--video=on'] : []),
  ];
  if (excludedTagNames(command).length > 0) args.push('--pass-with-no-tests');
  return { args, env: { VERIFY_CONTEXT: contextFile(context), AGENT_DEVICE_STATE_DIR: agentDeviceStateDir(context.workspace), E2E_TELEMETRY_DISABLED: '1' } };
}

function withoutKeys(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const { CLERK_TEST_KEYS_JSON: _keys, ...rest } = env;
  return rest;
}

export async function invokeE2E(invocation: E2EInvocation, log: EvidencePath, skillDir: string, onLine: (line: string) => void): Promise<{ readonly exitCode: number }> {
  const bin = join(skillDir, 'node_modules', '.bin', 'e2e');
  if (!existsSync(bin)) throw new VerifyFailure('NOT_READY', 'the pinned e2e is not installed', `cd ${skillDir} && npm ci`);
  return new Promise((resolvePromise) => {
    const child = spawn(bin, [...invocation.args], {
      cwd: skillDir,
      env: { ...withoutKeys(process.env), ...invocation.env, NO_COLOR: '1' },
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
  /** Artifact id of the screen text at failure. */
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
    throw new VerifyFailure('E2E_CRASHED', 'e2e wrote a report this skill cannot read (expected schemaVersion report-1)', 'check e2e-pins with `bin/verify doctor`');
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

export function parseE2EReport(reportJson: unknown, specs: readonly SpecRef[], runDir: EvidencePath, excluded: readonly OptInTag[] = [KNOWN_BUG_TAG]): readonly SpecResult[] {
  const failuresDir = join(runDir, 'e2e', 'failures');
  const pages = existsSync(failuresDir) ? readdirSync(failuresDir) : [];
  const selected = new Set(specs.map((s) => s.path));
  return wireResults(reportJson)
    .filter((r) => (r.kind === 'test' || r.kind === 'setup') && (selected.size === 0 || selected.has(r.file ?? '')))
    .map((r): SpecResult => {
      const file = r.file ?? '';
      const spec = specs.find((s) => s.path === file) ?? { kind: 'explored', path: file, feature: null };
      const attempts = r.attempts ?? [];
      const last = attempts.at(-1);
      const notRun = r.status === 'skipped' && r.skip?.cause !== 'filtered' && r.skip?.cause !== 'platform-unavailable';
      const status = notRun ? 'failed' : (STATUS[r.status ?? ''] ?? 'failed');
      const page = r.id === undefined ? undefined : pages.find((p) => p.endsWith(`-${r.id!.slice(0, 8)}.md`));
      const artifactPath = (id: string | undefined): EvidencePath | null => {
        const path = id === undefined ? undefined : last?.artifacts?.find((a) => a.id === id)?.path;
        return path === undefined ? null : (join(runDir, 'e2e', 'artifacts', path) as EvidencePath);
      };
      const screenPath = artifactPath(last?.failure?.screen);
      const excludedBy = (tag: OptInTag) => excluded.includes(tag) && (r.tags ?? []).includes(tag);
      let skipReason: string | null = null;
      if (status === 'skipped') {
        skipReason =
          r.skip?.cause === 'platform-unavailable'
            ? platformSkip(r.skip.reason)
            : r.skip?.cause === 'filtered' && excludedBy(KNOWN_BUG_TAG)
              ? `skipped: ${KNOWN_BUG_TAG}`
              : r.skip?.cause === 'filtered' && excludedBy(FORM_ENTRY_TAG)
                ? `skipped by --skip ${FORM_ENTRY_TAG}`
                : `${r.skip?.cause ?? 'skipped'}: ${r.skip?.reason ?? ''}`.trim();
      }
      const message = notRun ? `not run: ${r.skip?.cause ?? 'skipped'} ${r.skip?.reason ?? ''}`.trim() : last?.error?.message;
      return {
        spec,
        title: (r.titlePath ?? []).join(' > '),
        platform: r.platform === 'android' ? 'android' : 'ios',
        status,
        seconds: Math.round(attempts.reduce((sum, a) => sum + (a.durationMs ?? 0), 0) / 100) / 10,
        error: message === undefined ? null : redact(message.split('\n').filter((line) => line.trim().length > 0).join('; ')),
        skipReason,
        tags: r.tags ?? [],
        failurePage: page === undefined ? null : (join(failuresDir, page) as EvidencePath),
        failureScreen: screenPath !== null && existsSync(screenPath) ? (screenPath as EvidencePath) : null,
        failureScreenshot: artifactPath(last?.failure?.screenshot),
      };
    });
}

export function collectScreenshots(reportJson: unknown, runDir: EvidencePath): readonly { readonly label: string; readonly path: EvidencePath }[] {
  const out = new Map<string, EvidencePath>();
  const dir = join(runDir, 'screenshots');
  for (const result of wireResults(reportJson)) {
    for (const attempt of result.attempts ?? []) {
      const steps = new Map((attempt.steps ?? []).map((s) => [s.id, s]));
      for (const artifact of attempt.artifacts ?? []) {
        if (artifact.kind !== 'screenshot' || artifact.path === undefined) continue;
        const step = artifact.producer?.stepId === undefined ? undefined : steps.get(artifact.producer.stepId);
        if (step?.api !== 'app.screenshot' || !step.label) continue;
        const source = join(runDir, 'e2e', 'artifacts', artifact.path);
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
