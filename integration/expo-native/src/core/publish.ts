import { randomBytes } from 'node:crypto';
import { constants, copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';
import { run as defaultRunner, type Runner } from './exec.ts';
import type { Publishable, Showable } from './evidence.ts';
import { VerifyFailure, everyFile, type AttachResult, type EvidenceBundle, type EvidencePath, type EvidenceSummary, type HostAdapter, type MediaChoice, type Platform } from './types.ts';

export function summarize(evidence: Showable): EvidenceSummary {
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

const BLOCK_LINE_START = '**Verified on ';
const A_BLOCK_STARTS = /^(\*\*Verified on |verify run `)/;
const WHERE: Readonly<Record<Platform, string>> = { ios: 'an iOS simulator', android: 'an Android emulator' };

const counted = (summary: EvidenceSummary): string => `${summary.passed} of ${summary.total} passed${summary.flaky === 0 ? '' : `, ${summary.flaky} flaky (passed only on a retry)`}`;
const short = (commit: string): string => commit.slice(0, 12);

export function evidenceBlock(summary: EvidenceSummary, before: EvidenceSummary | null, media: readonly string[]): string {
  const { start, end } = evidenceMarkers(summary.platform);
  const was = before === null ? '' : ` Before is run \`${before.run}\` at \`${short(before.commit)}\`, ${counted(before)}.`;
  const line = `${BLOCK_LINE_START}${WHERE[summary.platform]}.** Run \`${summary.run}\` on \`${summary.device}\` at \`${short(summary.commit)}\`, ${counted(summary)}.${was}`;
  return [start, '', line, ...media.flatMap((part) => ['', part]), '', end].join('\n');
}

const IMAGE_WIDTH = 280;
const ACROSS = 2;

const isVideo = (name: string): boolean => name.endsWith('.mp4');
const stem = (name: string): string => name.replace(/\.[a-z0-9]+$/, '');
const table = (header: readonly string[], rows: readonly (readonly string[])[]): string => [header, header.map(() => ':---:'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n');

// `gh pr edit --attach` rewrites only a markdown reference to a file, so the files go up as a list first, and the tables are written from the addresses GitHub gave them.
export const mediaList = (names: readonly string[], onDisk: readonly string[]): readonly string[] => names.map((name, at) => `![${isVideo(name) ? name : stem(name)}](./${onDisk[at]})`);

export function mediaTables(files: readonly string[], hasBefore: boolean, uploaded: readonly string[]): readonly string[] {
  const shown = files.map((name, at) => {
    const label = stem(name);
    const cell = (url: string, alt: string): string => (isVideo(name) ? url : `<img src="${url}" width="${IMAGE_WIDTH}" alt="${alt}">`);
    return { video: isVideo(name), label, after: cell(uploaded[at]!, hasBefore ? `After: ${label}` : label), before: hasBefore ? cell(uploaded[files.length + at]!, `Before: ${label}`) : '' };
  });
  return [false, true].flatMap((video) => {
    const some = shown.filter((item) => item.video === video);
    if (some.length === 0) return [];
    if (hasBefore) return [table(['Before', 'After'], some.map((item) => [item.before, item.after]))];
    const rows = Array.from({ length: Math.ceil(some.length / ACROSS) }, (_, row) => some.slice(row * ACROSS, (row + 1) * ACROSS));
    return rows.map((row) => table(row.map((item) => `\`${item.label}\``), [row.map((item) => item.after)]));
  });
}

export class CannotPostHere extends VerifyFailure {
  readonly why: string;
  constructor(why: string, message: string, fix: string) {
    super('NOT_READY', message, fix);
    this.why = why;
  }
}

export type BlockEdit = { readonly ok: true; readonly body: string; readonly was: 'added' | 'replaced' } | { readonly ok: false; readonly why: string; readonly fix: string };

const ONE_PAIR_OF_MARKERS = 'leave one pair of those markers in the description, or none';

function fencedCode(text: string): { readonly fences: readonly (readonly [number, number])[]; readonly neverCloses: boolean } {
  const fences: [number, number][] = [];
  let open: { readonly char: string; readonly length: number; readonly at: number } | null = null;
  let inHtmlComment = false;
  for (let at = 0; at <= text.length; ) {
    const newline = text.indexOf('\n', at);
    const lineEnd = newline === -1 ? text.length : newline;
    const line = text.slice(at, lineEnd).replace(/\r$/, '');
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (open === null && (inHtmlComment || /^ {0,3}<!--/.test(line))) {
      inHtmlComment = !line.includes('-->');
    } else if (fence !== null) {
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
  return { fences, neverCloses: open !== null };
}

function linesThatAre(text: string, marker: string): number[] {
  const { fences } = fencedCode(text);
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
    if (fencedCode(body).neverCloses) return { ok: false, why: 'ends inside a code fence that is never closed', fix: 'close that code fence' };
    const gap = body === '' ? '' : body.endsWith('\n') ? newline : `${newline}${newline}`;
    return { ok: true, body: `${body}${gap}${block}`, was: 'added' };
  }
  if (starts.length !== 1 || ends.length !== 1) return { ok: false, why: `has \`${start}\` ${starts.length} times and \`${end}\` ${ends.length} times`, fix: ONE_PAIR_OF_MARKERS };
  if (ends[0]! < starts[0]!) return { ok: false, why: `has \`${end}\` before \`${start}\``, fix: ONE_PAIR_OF_MARKERS };
  const between = body.slice(starts[0]! + start.length, ends[0]!).trimStart();
  if (between !== '' && !A_BLOCK_STARTS.test(between)) return { ok: false, why: `has text between \`${start}\` and \`${end}\` that is not an evidence block`, fix: ONE_PAIR_OF_MARKERS };
  return { ok: true, body: `${body.slice(0, starts[0]!)}${block}${body.slice(ends[0]! + end.length)}`, was: 'replaced' };
}

const ATTACH_FIX = 'install gh 2.99.0 or newer, whose `gh pr edit` has --attach';

export async function missingAttach(runner: Runner): Promise<{ readonly why: string; readonly fix: string } | null> {
  const help = await runner('gh', ['pr', 'edit', '--help']);
  if (help.code === 0 && help.stdout.includes('--attach')) return null;
  return { why: help.code === 0 ? 'this gh has no `gh pr edit --attach`' : 'gh is not installed', fix: ATTACH_FIX };
}

export function chooseEvidence(pr: number, evidence: Publishable, before: Showable | null, media: MediaChoice): EvidenceBundle {
  const missing = (what: string, fix: string): never => {
    throw new VerifyFailure('USAGE', what, fix);
  };
  const shots = media.screenshots.map(
    (label) => evidence.screenshots.find((s) => s.label === label) ?? missing(`run ${evidence.run} has no screenshot labelled ${label}`, `use one of: ${evidence.screenshots.map((s) => s.label).join(', ') || '(none)'}`),
  );
  const noVideo = (run: string): string => `run ${run} has no video: a run records one from the first time a test launches the app, unless it has --no-video`;
  const video = media.video ? [evidence.videos[0] ?? missing(noVideo(evidence.run), '{cli} run a spec that calls host.launch, without --no-video, and attach that run, or attach this one with --screenshot <label>')] : [];
  const files = [...shots.map((shot) => shot.path), ...video].map((path) => ({ name: basename(path), path }));
  const summary = summarize(evidence);
  if (before === null) return { pr, summary, files, before: null };

  const was = [
    ...shots.map(
      ({ label, test }) =>
        before.screenshots.find((s) => s.label === label)?.path ??
        before.results.find((r) => test !== undefined && basename(r.spec.path) === basename(test.spec) && r.title === test.title)?.failureScreenshot ??
        (test === undefined
          ? missing(`run ${before.run} has no screenshot labelled ${label}, and run ${evidence.run} does not record which test took ${label}`, '{cli} run the spec again and attach that run, or attach without --before')
          : missing(
              `run ${before.run} has no screenshot labelled ${label}, and no failure screenshot of the test "${test.title}" in ${basename(test.spec)} to show in its place`,
              `call host.screenshot('${label}') in the spec and run it on the build without the change, or attach without --before`,
            )),
    ),
    ...video.map(() => before.videos[0] ?? missing(noVideo(before.run), '{cli} run it again without --no-video, or attach without --video or without --before')),
  ];
  return { pr, summary, files, before: { summary: summarize(before), files: was.map((path, at) => ({ name: `before-${files[at]!.name}`, path })) } };
}

const UPLOADED = /https:\/\/github\.com\/user-attachments\/assets\/[0-9a-f-]{36}/g;

function blockIn(body: string, platform: Platform): string | null {
  const { start, end } = evidenceMarkers(platform);
  const starts = linesThatAre(body, start);
  const ends = linesThatAre(body, end);
  if (starts.length !== 1 || ends.length !== 1 || ends[0]! < starts[0]!) return null;
  return body.slice(starts[0]!, ends[0]! + end.length).replaceAll('\r\n', '\n');
}

function uploadedIn(body: string, platform: Platform, run: string): readonly string[] {
  const block = blockIn(body, platform);
  return block === null || !block.includes(`\`${run}\``) ? [] : (block.match(UPLOADED) ?? []);
}

async function readDescription(runner: Runner, repo: string, pr: number): Promise<{ readonly body: string; readonly url: string }> {
  const viewed = await runner('gh', ['pr', 'view', String(pr), '--repo', repo, '--json', 'body,url,state']);
  if (viewed.code !== 0) throw new CannotPostHere('gh pr view failed', `gh pr view failed: ${viewed.stderr.trim()}`, 'check `gh auth status` and that the PR exists');
  const parsed = JSON.parse(viewed.stdout) as { readonly body?: string | null; readonly url?: string; readonly state?: string };
  if (parsed.state !== 'OPEN') {
    throw new VerifyFailure('USAGE', `PR #${pr} of ${repo} is ${parsed.state?.toLowerCase() ?? 'not known to be open'}, and attach writes only to an open pull request`, `pass the number of an open pull request as --pr, or reopen PR #${pr}, then rerun {cli} attach`);
  }
  return { body: parsed.body ?? '', url: parsed.url ?? '' };
}

export async function postToPullRequest(bundle: EvidenceBundle, host: HostAdapter, runner: Runner = defaultRunner): Promise<AttachResult> {
  const { pr, summary } = bundle;
  const { run, platform } = summary;
  const before = bundle.before?.summary ?? null;
  const files = everyFile(bundle);
  const paths = files.map((file) => file.path);
  const missing = await missingAttach(runner);
  if (missing !== null) throw new CannotPostHere(missing.why, `${missing.why}, so the video and screenshots of run ${run} cannot be posted`, missing.fix);

  const prefix = `evidence-${randomBytes(8).toString('hex')}`;
  const onDisk = files.map((file, at) => `${prefix}-${at + 1}${extname(file.name)}`);
  const listed = evidenceBlock(summary, before, mediaList(files.map((file) => file.name), onDisk));
  const laidOutWith = (uploaded: readonly string[]): string => evidenceBlock(summary, before, mediaTables(bundle.files.map((file) => file.name), before !== null, uploaded));

  let current = await readDescription(runner, host.githubRepo, pr);
  const there = blockIn(current.body, platform);
  const anUpload = 'https://github.com/user-attachments/assets/00000000-0000-0000-0000-000000000000';
  if (there !== null && there.match(UPLOADED)?.length === files.length && there.replace(UPLOADED, anUpload) === laidOutWith(files.map(() => anUpload))) {
    return { verb: 'attach', via: 'gh', prUrl: current.url, posted: paths, alreadyPosted: true };
  }
  let next: string | null = null;
  for (let attempt = 0; attempt < 2 && next === null; attempt += 1) {
    const edit = withEvidenceBlock(current.body, platform, listed);
    if (!edit.ok) {
      throw new VerifyFailure('NOT_READY', `the description of PR #${pr} ${edit.why}, so the evidence of run ${run} has no one place to go`, `${edit.fix}, then rerun`);
    }
    const again = await readDescription(runner, host.githubRepo, pr);
    if (again.body === current.body) next = edit.body;
    else current = again;
  }
  if (next === null) {
    throw new VerifyFailure('NOT_READY', `the description of PR #${pr} changed twice while the evidence of run ${run} was being placed, so nothing was written`, 'rerun {cli} attach once nobody is editing the description');
  }

  const scratch = mkdtempSync(join(tmpdir(), 'verify-attach-'));
  try {
    files.forEach((file, at) => copyFileSync(file.path, join(scratch, onDisk[at]!), constants.COPYFILE_FICLONE));
    const bodyFile = join(scratch, 'body.md');
    const edit = (body: string, attach: readonly string[]) => {
      writeFileSync(bodyFile, body);
      return runner('gh', ['pr', 'edit', String(pr), '--repo', host.githubRepo, '--body-file', bodyFile, ...attach.flatMap((name) => ['--attach', `./${name}`])], { cwd: scratch });
    };
    const sent = await edit(next, onDisk);
    if (sent.code !== 0) {
      throw new CannotPostHere('gh pr edit failed', `gh pr edit failed: ${sent.stderr.trim()}`, 'check `gh auth status` and that you can edit the PR; a file that did upload is in the description already');
    }
    const prUrl = /https:\/\/github\.com\/\S+/.exec(sent.stdout)?.[0] ?? current.url;

    const notLaidOut = (why: string): VerifyFailure =>
      new VerifyFailure('NOT_READY', `the files of run ${run} are in the description of PR #${pr} as a list, one under the other, and were not laid out: ${why}`, 'rerun {cli} attach once nobody is editing the description');
    const listedNow = (await readDescription(runner, host.githubRepo, pr)).body;
    const uploaded = uploadedIn(listedNow, platform, run);
    if (uploaded.length !== files.length) throw notLaidOut(`the block there now does not show run ${run} with the ${files.length} addresses GitHub gave its files`);
    const laidOut = withEvidenceBlock(listedNow, platform, laidOutWith(uploaded));
    if (!laidOut.ok) throw notLaidOut(`the description ${laidOut.why}`);
    const arranged = await edit(laidOut.body, []);
    if (arranged.code !== 0) throw notLaidOut(`gh pr edit failed: ${arranged.stderr.trim()}`);

    return { verb: 'attach', via: 'gh', prUrl, posted: paths, alreadyPosted: false };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
