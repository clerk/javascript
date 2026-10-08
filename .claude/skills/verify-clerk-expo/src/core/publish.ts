import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { run as defaultRunner, type Runner } from './exec.ts';
import type { Publishable } from './evidence.ts';
import { VerifyFailure, type AttachResult, type EvidencePath, type HostAdapter } from './types.ts';

interface Posted {
  readonly pr: number;
  readonly commentUrl: string;
  readonly posted: readonly EvidencePath[];
}

function tally(results: Publishable['results']): string {
  const flaky = results.filter((r) => r.status === 'flaky').length;
  return `${results.filter((r) => r.status === 'passed').length} of ${results.length} passed${flaky === 0 ? '' : `, ${flaky} flaky (passed only on a retry)`}.`;
}

export function commentBody(evidence: Publishable): string {
  const lines = [
    `verify run \`${evidence.run}\` on ${evidence.platform} (${evidence.device}), build \`${evidence.build}\`, ${tally(evidence.results)}`,
    '',
    ...evidence.results.map((r) => `- ${r.status}: \`${r.spec.path}\` ${r.title}`),
  ];
  for (const group of evidence.settings) {
    if (group.askedBy === null) continue;
    const results = evidence.results.filter((r) => group.specs.includes(r.spec.path));
    lines.push('', `Instance settings \`${group.label}\` (declared by \`${group.askedBy}\`): ${tally(results)}`);
  }
  return lines.join('\n');
}

const ATTACH_FIX = 'install a gh build whose `gh pr comment` has --attach';

export async function missingAttach(runner: Runner): Promise<{ readonly why: string; readonly fix: string } | null> {
  const help = await runner('gh', ['pr', 'comment', '--help']);
  if (help.code === 0 && help.stdout.includes('--attach')) return null;
  return { why: help.code === 0 ? 'this gh has no `gh pr comment --attach`' : 'gh is not installed', fix: ATTACH_FIX };
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
    return { verb: 'attach', commentUrl: previous.commentUrl, posted: previous.posted, alreadyPosted: true };
  }
  const chosen =
    screenshots === 'all'
      ? evidence.screenshots
      : screenshots.map((label) => {
          const shot = evidence.screenshots.find((s) => s.label === label);
          if (shot === undefined) {
            throw new VerifyFailure('USAGE', `run ${evidence.run} has no screenshot labelled ${label}`, `use one of: ${evidence.screenshots.map((s) => s.label).join(', ') || '(none)'}`);
          }
          return shot;
        });
  const files = [...evidence.videos, ...chosen.map((s) => s.path)];
  const missing = files.length === 0 ? null : await missingAttach(runner);
  if (missing !== null) throw new VerifyFailure('NOT_READY', `${missing.why}, so the video and screenshots of run ${evidence.run} cannot be posted`, missing.fix);
  const args = ['pr', 'comment', String(pr), '--repo', host.githubRepo, '--body', commentBody(evidence), ...files.flatMap((f) => ['--attach', f])];
  const result = await runner('gh', args);
  if (result.code !== 0) {
    throw new VerifyFailure('NOT_READY', `gh pr comment failed: ${result.stderr.trim()}`, 'check `gh auth status` and that the PR exists');
  }
  const commentUrl = /https:\/\/github\.com\/\S+/.exec(result.stdout)?.[0] ?? result.stdout.trim();
  const posted: Posted = { pr, commentUrl, posted: files };
  writeFileSync(postedFile, `${JSON.stringify(posted, null, 2)}\n`);
  return { verb: 'attach', commentUrl, posted: files, alreadyPosted: false };
}
