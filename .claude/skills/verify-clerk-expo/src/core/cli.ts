import { execFileSync } from 'node:child_process';
import { basename, dirname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run as defaultRunner } from './exec.ts';
import { redact } from './secret.ts';
import { leaseLine } from './devices.ts';
import { count, describeState } from './state.ts';
import { defaultClerk, verbs, type Deps } from './verbs.ts';
import { openWorkspace, parseRunId } from './workspace.ts';
import {
  FORM_ENTRY_TAG,
  KNOWN_BUG_TAG,
  CLI_PLACEHOLDER,
  RETRYABLE,
  VerifyFailure,
  type BackendKind,
  type Command,
  type HostAdapter,
  type Invocation,
  type OptInTag,
  type Platform,
  type RunResult,
  type Verb,
  type VerbResult,
} from './types.ts';

const VERBS: readonly Verb[] = ['doctor', 'up', 'run', 'screen', 'attach', 'down'];

const USAGE_FIX = [
  '{cli} doctor [--platform p] [--backend b]',
  '{cli} up [--platform p] [--backend b] [--wait <seconds>]',
  '{cli} run <feature|feature/spec|path.e2e.ts>... | --all [--platform p] [--skip form-entry] [--include known-bug] [--grep re] [--no-video] [--wait <seconds>]',
  '{cli} screen [--platform p] [--png]',
  '{cli} attach <run-id> --pr <n> [--screenshot label]...',
  '{cli} down [--platform p] [--stale] [--dry-run]',
  'every verb takes --json',
].join('; ');

const usage = (message: string) => new VerifyFailure('USAGE', message, USAGE_FIX);

type FlagSpec = Readonly<Record<string, 'value' | 'bool' | 'list'>>;

const FLAGS: Readonly<Record<Verb, FlagSpec>> = {
  doctor: { platform: 'value', backend: 'value' },
  up: { platform: 'value', backend: 'value', wait: 'value' },
  run: { platform: 'value', backend: 'value', all: 'bool', skip: 'list', include: 'list', grep: 'value', 'no-video': 'bool', wait: 'value' },
  screen: { platform: 'value', png: 'bool' },
  attach: { pr: 'value', screenshot: 'list' },
  down: { platform: 'value', stale: 'bool', 'dry-run': 'bool' },
};

function platformFlag(value: string | undefined): Platform | undefined {
  if (value === undefined) return undefined;
  if (value === 'ios' || value === 'android') return value;
  throw usage(`--platform must be ios or android, not ${value}`);
}

function backendFlag(value: string | undefined): BackendKind | undefined {
  if (value === undefined) return undefined;
  if (value === 'local' || value === 'eas') return value;
  throw usage(`--backend must be local or eas, not ${value}`);
}

function positiveInt(flag: string, value: string | undefined, fallback: number | undefined): number {
  if (value === undefined) {
    if (fallback === undefined) throw usage(`--${flag} is required`);
    return fallback;
  }
  if (!/^\d+$/.test(value)) throw usage(`--${flag} must be a whole number, not ${value}`);
  return Number(value);
}

export function parseArgv(argv: readonly string[]): Invocation {
  const [verbArg, ...rest] = argv;
  const verb = VERBS.find((v) => v === verbArg);
  if (verb === undefined) throw usage(verbArg === undefined ? 'no verb given' : `unknown verb ${verbArg}`);
  const spec = FLAGS[verb];
  const values = new Map<string, string>();
  const lists = new Map<string, string[]>();
  const bools = new Set<string>();
  const positionals: string[] = [];
  let json = false;
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i]!;
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const [name, inline] = arg.slice(2).split(/=(.*)/s, 2) as [string, string | undefined];
    if (name === 'json' && inline === undefined) {
      json = true;
      continue;
    }
    const kind = spec[name];
    if (kind === undefined) throw usage(`verify ${verb} does not take --${name}`);
    if (kind === 'bool') {
      if (inline !== undefined) throw usage(`--${name} takes no value`);
      bools.add(name);
      continue;
    }
    const value = inline ?? rest[(i += 1)];
    if (value === undefined || value.startsWith('--')) throw usage(`--${name} needs a value`);
    if (kind === 'list') lists.set(name, [...(lists.get(name) ?? []), value]);
    else {
      if (values.has(name)) throw usage(`--${name} given twice`);
      values.set(name, value);
    }
  }
  const noPositionals = () => {
    if (positionals.length > 0) throw usage(`verify ${verb} takes no arguments, got ${positionals.join(' ')}`);
  };
  const platform = platformFlag(values.get('platform'));
  const backend = backendFlag(values.get('backend'));
  const base = { ...(platform === undefined ? {} : { platform }), ...(backend === undefined ? {} : { backend }) };

  let command: Command;
  switch (verb) {
    case 'doctor':
      noPositionals();
      command = { verb, ...base };
      break;
    case 'up':
      noPositionals();
      command = { verb, ...base, waitSeconds: positiveInt('wait', values.get('wait'), 0) };
      break;
    case 'run': {
      const all = bools.has('all');
      if (all && positionals.length > 0) throw usage('pass selectors or --all, not both');
      if (!all && positionals.length === 0) throw usage('{cli} run needs a feature, feature/spec, path.e2e.ts, or --all');
      const tags = (flag: string, allowed: OptInTag) =>
        (lists.get(flag) ?? []).map((tag): OptInTag => {
          if (tag !== allowed) throw usage(`--${flag} takes ${allowed}, not ${tag}`);
          return tag;
        });
      const skip = tags('skip', FORM_ENTRY_TAG);
      const include = tags('include', KNOWN_BUG_TAG);
      const grep = values.get('grep');
      command = {
        verb,
        ...base,
        selection: all ? { all: true } : { selectors: positionals },
        skip,
        include,
        ...(grep === undefined ? {} : { grep }),
        video: !bools.has('no-video'),
        waitSeconds: positiveInt('wait', values.get('wait'), 0),
      };
      break;
    }
    case 'screen':
      noPositionals();
      command = { verb, ...(platform === undefined ? {} : { platform }), png: bools.has('png') };
      break;
    case 'attach': {
      if (positionals.length !== 1) throw usage('{cli} attach takes exactly one run id');
      const shots = lists.get('screenshot');
      command = { verb, run: parseRunId(positionals[0]!), pr: positiveInt('pr', values.get('pr'), undefined), screenshots: shots ?? 'all' };
      break;
    }
    case 'down':
      noPositionals();
      command = { verb, ...(platform === undefined ? {} : { platform }), stale: bools.has('stale'), dryRun: bools.has('dry-run') };
      break;
    default: {
      const exhaustive: never = verb;
      throw usage(`unknown verb ${String(exhaustive)}`);
    }
  }
  return { command, json };
}

export interface Output {
  result(value: VerbResult): void;
  failure(error: VerifyFailure): void;
  progress(line: string): void;
}

interface Sink {
  write(text: string): unknown;
}

const pad = (text: string, width: number) => text.padEnd(width);

function rel(skillDir: string, path: string): string {
  return relative(skillDir, path) || path;
}

function renderRun(result: RunResult, skillDir: string): string[] {
  const r = result.record;
  const lines: string[] = [];
  const width = Math.max(0, ...r.results.map((x) => x.spec.path.replace(/^specs\/(golden\/)?/, '').length));
  for (const x of r.results) {
    const label = { passed: 'pass', failed: 'FAIL', skipped: 'skip', flaky: 'flaky', interrupted: 'INTR' }[x.status];
    const name = x.spec.path.replace(/^specs\/(golden\/)?/, '');
    const tail = x.status === 'skipped' ? (x.skipReason ?? '') : `${x.seconds}s`;
    lines.push(`  ${pad(label, 5)} ${pad(name, width)}  ${x.title}  ${tail}`);
    if (x.error !== null) lines.push(`        ${x.error}`);
    if (x.status === 'passed' && x.tags.includes(KNOWN_BUG_TAG)) lines.push('        passed with --include known-bug: the bug may be fixed; drop the tag');
    if (x.failurePage !== null) lines.push(`        failure page  ${rel(skillDir, x.failurePage)}`);
    if (x.failureScreenshot !== null) lines.push(`        screenshot    ${rel(skillDir, x.failureScreenshot)}`);
  }
  lines.push(`evidence  ${rel(process.cwd(), result.dir)}`);
  if (r.videos.length > 0) lines.push(`  video        ${r.videos.map((v) => basename(v)).join(', ')}`);
  if (r.screenshots.length > 0) lines.push(`  screenshots  ${r.screenshots.map((s) => basename(s.path)).join(', ')}`);
  if (r.lastState !== null) lines.push(`  last state   ${describeState(r.lastState)}  (the last test only; every state is in states.jsonl)`);
  if (r.appLog !== null) lines.push(`  app log      ${basename(r.appLog)}`);
  if (r.tainted.length > 0) lines.push(`  TAINTED      ${r.tainted.map((t) => rel(result.dir, t)).join(', ')} (attach is blocked)`);
  lines.push(`next  ${isAbsolute(result.next) ? rel(process.cwd(), result.next) : result.next}`);
  return lines;
}

function render(value: VerbResult, skillDir: string): string[] {
  switch (value.verb) {
    case 'doctor': {
      const width = Math.max(...value.checks.map((c) => c.id.length));
      return value.checks.flatMap((c) => [`${pad(c.ok ? 'ok' : 'FAIL', 5)} ${pad(c.id, width)}  ${c.detail}`, ...(c.fix === undefined ? [] : [`      fix: ${c.fix}`])]);
    }
    case 'up':
      return [
        ...value.leases.map(leaseLine),
      ];
    case 'run':
      return renderRun(value, skillDir);
    case 'screen': {
      const lines = [`screen  ${value.platform}  ${value.device}`];
      for (const node of value.nodes) {
        const label = node.name ?? node.text;
        if (label === null && node.testId === null) continue;
        lines.push(
          `${'  '.repeat(Math.min(node.depth, 8))}${pad(node.role, 10)} ${label === null ? '' : JSON.stringify(label)}${node.testId === null ? '' : `  id=${node.testId}`}${node.locator === null ? '' : `  ${node.locator}`}`,
        );
      }
      lines.push(value.state === null ? 'state   no verify.state on screen' : `state   ${describeState(value.state)}`);
      if (value.png !== null) lines.push(`png     ${rel(process.cwd(), value.png)}`);
      return lines;
    }
    case 'attach':
      return [`${value.alreadyPosted ? 'already posted' : 'posted'}  ${value.posted.map((p) => basename(p)).join(', ')}  ${value.commentUrl}`];
    case 'down':
      return [
        ...(value.dryRun
          ? [
              'dry run: nothing was changed',
              `would release  ${value.wouldRelease.map((l) => l.device).join(', ') || 'nothing'}`,
              `would delete   ${count(value.wouldDelete.filter((t) => t.kind === 'user').length, 'user')}, ${count(value.wouldDelete.filter((t) => t.kind === 'organization').length, 'organization')}`,
              ...value.wouldDelete.map((t) => (t.kind === 'user' ? `  user          ${t.instance}  ${t.id}  ${t.email}` : `  organization  ${t.instance}  ${t.id}  ${t.name}`)),
              stoppedLine('would stop', value.wouldStop),
            ]
          : [
              `released  ${value.released.map((l) => l.device).join(', ') || 'nothing'}`,
              `deleted   ${count(value.deletedUsers, 'user')}, ${count(value.deletedOrganizations, 'organization')}`,
              stoppedLine('stopped', value.stoppedProcesses),
            ]),
        `kept      ${count(value.keptRuns.length, 'run')} in .verify/runs/`,
      ];
    default: {
      const exhaustive: never = value;
      return [JSON.stringify(exhaustive)];
    }
  }
}

/** Every line passes the redactor, and every CLI_PLACEHOLDER becomes the command as the host says to type it. */
export function createOutput(json: boolean, skillDir: string, cli: string, stdout: Sink = process.stdout, stderr: Sink = process.stderr): Output {
  const text = (value: string) => redact(value).replaceAll(CLI_PLACEHOLDER, cli);
  return {
    result(value) {
      if (json) stdout.write(`${text(JSON.stringify({ ok: true, ...value }))}\n`);
      else stdout.write(`${text(render(value, skillDir).join('\n'))}\n`);
    },
    failure(error) {
      const body = { code: error.code, message: error.message, fix: error.fix, retryable: RETRYABLE.has(error.code) };
      if (json) stdout.write(`${text(JSON.stringify({ ok: false, error: body }))}\n`);
      else stderr.write(`${text(`error  ${error.code}  ${error.message}\n      fix: ${error.fix}`)}\n`);
    },
    progress(line) {
      if (!json) stderr.write(`${text(line)}\n`);
    },
  };
}

function stoppedLine(label: string, processes: readonly string[]): string {
  const daemon = processes.some((p) => p.startsWith('agent-device ')) ? '' : '; no agent-device daemon running';
  return `${label}   ${processes.join(', ') || 'nothing'}${daemon}`;
}

export function exitCodeFor(value: VerbResult): number {
  if (value.verb === 'doctor') return value.ok ? 0 : 3;
  if (value.verb === 'run') return value.record.results.some((r) => r.status === 'failed' || r.status === 'interrupted') ? 1 : 0;
  return 0;
}

export const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export async function main(argv: readonly string[], host: HostAdapter): Promise<number> {
  let invocation: Invocation;
  try {
    invocation = parseArgv(argv);
  } catch (error) {
    const failure = error instanceof VerifyFailure ? error : usage(String(error));
    createOutput(argv.includes('--json'), SKILL_DIR, host.cli).failure(failure);
    return 2;
  }
  const out = createOutput(invocation.json, SKILL_DIR, host.cli);
  try {
    const worktree = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: SKILL_DIR, encoding: 'utf8' }).trim();
    const workspace = openWorkspace({ skillDir: SKILL_DIR, worktree });
    const deps: Deps = {
      host,
      workspace,
      runner: defaultRunner,
      env: process.env,
      progress: (line) => out.progress(line),
      clerk: defaultClerk(host, worktree, process.env),
    };
    const command = invocation.command;
    let result: VerbResult;
    switch (command.verb) {
      case 'doctor':
        result = await verbs.doctor(deps, command);
        break;
      case 'up':
        result = await verbs.up(deps, command);
        break;
      case 'run':
        result = await verbs.run(deps, command);
        break;
      case 'screen':
        result = await verbs.screen(deps, command);
        break;
      case 'attach':
        result = await verbs.attach(deps, command);
        break;
      case 'down':
        result = await verbs.down(deps, command);
        break;
      default: {
        const exhaustive: never = command;
        throw usage(`unknown verb ${JSON.stringify(exhaustive)}`);
      }
    }
    out.result(result);
    return exitCodeFor(result);
  } catch (error) {
    const failure =
      error instanceof VerifyFailure ? error : new VerifyFailure('NOT_READY', (error as Error).message ?? String(error), 'run `{cli} doctor`, then retry');
    out.failure(failure);
    return failure.code === 'USAGE' ? 2 : 3;
  }
}
