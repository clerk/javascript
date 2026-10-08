import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative, sep } from 'node:path';
import { run as defaultRunner, type Runner } from './exec.ts';
import type { Publishable } from './evidence.ts';
import { VerifyFailure, type AttachResult, type EvidencePath, type EvidenceSummary, type HostAdapter, type Platform } from './types.ts';

interface Posted {
  readonly pr: number;
  readonly prUrl: string;
  readonly posted: readonly EvidencePath[];
}

export interface EvidenceMedia {
  readonly alt: string;
  readonly ref: string;
}

export function summarize(evidence: Publishable): EvidenceSummary {
  return {
    run: evidence.run,
    platform: evidence.platform,
    device: evidence.device.replace(/[^A-Za-z0-9 ._()-]/g, '-').replace(/^[^A-Za-z0-9]+/, '').slice(0, 64) || 'device',
    commit: evidence.gitHead,
    passed: evidence.results.filter((r) => r.status === 'passed').length,
    flaky: evidence.results.filter((r) => r.status === 'flaky').length,
    total: evidence.results.length,
  };
}

export const evidenceMarkers = (platform: Platform): { readonly start: string; readonly end: string } => ({
  start: `<!-- verify-evidence:${platform} -->`,
  end: `<!-- /verify-evidence:${platform} -->`,
});

const BLOCK_LINE_START = 'verify run `';

// GitHub plays a video only from a URL that is alone in its paragraph, and `gh pr edit --attach` rewrites a reference to that URL only there.
export function evidenceBlock(summary: EvidenceSummary, media: readonly EvidenceMedia[]): string {
  const { start, end } = evidenceMarkers(summary.platform);
  const flaky = summary.flaky === 0 ? '' : `, ${summary.flaky} flaky (passed only on a retry)`;
  const line = `${BLOCK_LINE_START}${summary.run}\` on \`${summary.device}\` at \`${summary.commit.slice(0, 12)}\`, ${summary.passed} of ${summary.total} passed${flaky}.`;
  return [start, '', line, ...media.flatMap((m) => ['', `![${m.alt}](${m.ref})`]), '', end].join('\n');
}

export type BlockEdit = { readonly ok: true; readonly body: string; readonly was: 'added' | 'replaced' } | { readonly ok: false; readonly why: string };

function fencedCode(text: string): readonly (readonly [number, number])[] {
  const fences: [number, number][] = [];
  let open: { readonly char: string; readonly length: number; readonly at: number } | null = null;
  for (let at = 0; at <= text.length; ) {
    const newline = text.indexOf('\n', at);
    const lineEnd = newline === -1 ? text.length : newline;
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text.slice(at, lineEnd).replace(/\r$/, ''));
    if (fence !== null) {
      const ticks = fence[1]!;
      const rest = fence[2]!;
      if (open === null && !(ticks[0] === '`' && rest.includes('`'))) open = { char: ticks[0]!, length: ticks.length, at };
      else if (open !== null && ticks[0] === open.char && ticks.length >= open.length && rest.trim() === '') {
        fences.push([open.at, lineEnd]);
        open = null;
      }
    }
    if (newline === -1) break;
    at = newline + 1;
  }
  if (open !== null) fences.push([open.at, text.length]);
  return fences;
}

function linesThatAre(text: string, marker: string): number[] {
  const fences = fencedCode(text);
  const found: number[] = [];
  for (let at = text.indexOf(marker); at !== -1; at = text.indexOf(marker, at + marker.length)) {
    const end = at + marker.length;
    const startsItsLine = at === 0 || text[at - 1] === '\n';
    const endsItsLine = end === text.length || text[end] === '\n' || text.startsWith('\r\n', end);
    if (startsItsLine && endsItsLine && !fences.some(([from, to]) => at > from && at < to)) found.push(at);
  }
  return found;
}

export function withEvidenceBlock(body: string, platform: Platform, lines: string): BlockEdit {
  const { start, end } = evidenceMarkers(platform);
  const starts = linesThatAre(body, start);
  const ends = linesThatAre(body, end);
  const newline = body.includes('\r\n') ? '\r\n' : '\n';
  const block = lines.replaceAll('\n', newline);
  if (starts.length === 0 && ends.length === 0) {
    const gap = body === '' ? '' : body.endsWith('\n') ? newline : `${newline}${newline}`;
    return { ok: true, body: `${body}${gap}${block}`, was: 'added' };
  }
  if (starts.length !== 1 || ends.length !== 1) return { ok: false, why: `has \`${start}\` ${starts.length} times and \`${end}\` ${ends.length} times` };
  if (ends[0]! < starts[0]!) return { ok: false, why: `has \`${end}\` before \`${start}\`` };
  if (!body.slice(starts[0]! + start.length, ends[0]!).trimStart().startsWith(BLOCK_LINE_START)) return { ok: false, why: `has text between \`${start}\` and \`${end}\` that is not an evidence block` };
  return { ok: true, body: `${body.slice(0, starts[0]!)}${block}${body.slice(ends[0]! + end.length)}`, was: 'replaced' };
}

const ATTACH_FIX = 'install gh 2.99.0 or newer, whose `gh pr edit` has --attach';

export async function missingAttach(runner: Runner): Promise<{ readonly why: string; readonly fix: string } | null> {
  const help = await runner('gh', ['pr', 'edit', '--help']);
  if (help.code === 0 && help.stdout.includes('--attach')) return null;
  return { why: help.code === 0 ? 'this gh has no `gh pr edit --attach`' : 'gh is not installed', fix: ATTACH_FIX };
}

export function chooseFiles(evidence: Publishable, screenshots: 'all' | readonly string[]): { readonly videos: readonly EvidencePath[]; readonly shots: Publishable['screenshots'] } {
  if (screenshots === 'all') return { videos: evidence.videos, shots: evidence.screenshots };
  const shots = screenshots.map((label) => {
    const shot = evidence.screenshots.find((s) => s.label === label);
    if (shot === undefined) {
      throw new VerifyFailure('USAGE', `run ${evidence.run} has no screenshot labelled ${label}`, `use one of: ${evidence.screenshots.map((s) => s.label).join(', ') || '(none)'}`);
    }
    return shot;
  });
  return { videos: evidence.videos, shots };
}

async function readDescription(runner: Runner, repo: string, pr: number): Promise<{ readonly body: string; readonly url: string }> {
  const viewed = await runner('gh', ['pr', 'view', String(pr), '--repo', repo, '--json', 'body,url']);
  if (viewed.code !== 0) throw new VerifyFailure('NOT_READY', `gh pr view failed: ${viewed.stderr.trim()}`, 'check `gh auth status` and that the PR exists');
  const parsed = JSON.parse(viewed.stdout) as { readonly body?: string | null; readonly url?: string };
  return { body: parsed.body ?? '', url: parsed.url ?? '' };
}

export async function postToPullRequest(
  evidence: Publishable,
  dir: EvidencePath,
  host: HostAdapter,
  pr: number,
  screenshots: 'all' | readonly string[],
  runner: Runner = defaultRunner,
): Promise<AttachResult> {
  const postedFile = join(dir, `posted-${pr}.json`);
  if (existsSync(postedFile)) {
    const previous = JSON.parse(readFileSync(postedFile, 'utf8')) as Posted;
    return { verb: 'attach', prUrl: previous.prUrl, posted: previous.posted, alreadyPosted: true };
  }
  const { videos, shots } = chooseFiles(evidence, screenshots);
  const files = [...videos, ...shots.map((s) => s.path)];
  const missing = files.length === 0 ? null : await missingAttach(runner);
  if (missing !== null) throw new VerifyFailure('NOT_READY', `${missing.why}, so the video and screenshots of run ${evidence.run} cannot be posted`, missing.fix);

  const ref = (file: EvidencePath): string => `./${relative(dir, file).split(sep).join('/')}`;
  const block = evidenceBlock(summarize(evidence), [
    ...videos.map((video) => ({ alt: basename(video), ref: ref(video) })),
    ...shots.map((shot) => ({ alt: shot.label, ref: ref(shot.path) })),
  ]);

  let current = await readDescription(runner, host.githubRepo, pr);
  let next: string | null = null;
  for (let attempt = 0; attempt < 2 && next === null; attempt += 1) {
    const edit = withEvidenceBlock(current.body, evidence.platform, block);
    if (!edit.ok) {
      throw new VerifyFailure('NOT_READY', `the description of PR #${pr} ${edit.why}, so the evidence of run ${evidence.run} has no one place to go`, 'leave one pair of those markers in the description, or none, then rerun');
    }
    const again = await readDescription(runner, host.githubRepo, pr);
    if (again.body === current.body) next = edit.body;
    else current = again;
  }
  if (next === null) {
    throw new VerifyFailure('NOT_READY', `the description of PR #${pr} changed twice while the evidence of run ${evidence.run} was being placed, so nothing was written`, 'rerun {cli} attach once nobody is editing the description');
  }

  const scratch = mkdtempSync(join(tmpdir(), 'verify-attach-'));
  try {
    const bodyFile = join(scratch, 'body.md');
    writeFileSync(bodyFile, next);
    const result = await runner('gh', ['pr', 'edit', String(pr), '--repo', host.githubRepo, '--body-file', bodyFile, ...files.flatMap((f) => ['--attach', ref(f)])], { cwd: dir });
    if (result.code !== 0) {
      throw new VerifyFailure('NOT_READY', `gh pr edit failed: ${result.stderr.trim()}`, 'check `gh auth status` and that you can edit the PR; a file that did upload is in the description already');
    }
    const prUrl = /https:\/\/github\.com\/\S+/.exec(result.stdout)?.[0] ?? current.url;
    const posted: Posted = { pr, prUrl, posted: files };
    writeFileSync(postedFile, `${JSON.stringify(posted, null, 2)}\n`);
    return { verb: 'attach', prUrl, posted: files, alreadyPosted: false };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
