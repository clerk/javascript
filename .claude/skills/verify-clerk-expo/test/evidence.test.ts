import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { heldInstances } from '../testing/fake-instances.ts';
import { describe, it } from 'node:test';
import { newTestEmail, parseTestEmail, parseTestPhone } from '../src/core/clerk.ts';
import { assertPublishable, loggedUserIds, sealEvidence } from '../src/core/evidence.ts';
import type { Runner } from '../src/core/exec.ts';
import { commentBody, postToPullRequest } from '../src/core/publish.ts';
import { Secret } from '../src/core/secret.ts';
import { attach } from '../src/core/verbs.ts';
import { newRunId, openWorkspace } from '../src/core/workspace.ts';
import type { BuildKey, EvidencePath, EvidenceRecord, HostAdapter, RunId } from '../src/core/types.ts';

const OWN_USER = 'user_own';

const hostLogLine = (userId: string | null): string =>
  `2026-10-03 00:00:01.000 Df E2EHost[1:1] [com.clerk.verify:state] verify {"launchId":"l1","screen":"home","signedIn":${userId !== null},"ticket":"succeeded"${userId === null ? '' : `,"userId":"${userId}"`},"v":1}\n`;

function partialRecord(dir: EvidencePath, run: RunId): Omit<EvidenceRecord, 'sealed' | 'tainted'> {
  return {
    run,
    startedAt: '2026-10-03T00:00:00.000Z',
    finishedAt: '2026-10-03T00:00:10.000Z',
    repo: 'clerk-ios',
    gitHead: 'abc',
    dirty: false,
    platform: 'ios',
    backend: 'local',
    remote: null,
    device: 'verify-ios-1',
    build: 'ios-000000000000' as BuildKey,
    results: [
      { spec: { kind: 'explored', path: 'specs/explored/a.e2e.ts', feature: null }, title: 'a', platform: 'ios', status: 'passed', seconds: 1, attempts: 1, error: null, skipReason: null, skippedBy: null, tags: [], failurePage: null, failureScreen: null, failureScreenshot: null },
    ],
    videos: [join(dir, 'video.mp4') as EvidencePath],
    screenshots: [{ label: 'profile', path: join(dir, 'screenshots', 'profile.png') as EvidencePath }],
    appLog: join(dir, 'app.log') as EvidencePath,
    e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath,
    identities: [{ email: newTestEmail(run, 1), userId: OWN_USER }],
    settings: [{ label: 'standard', askedBy: null, specs: ['specs/explored/a.e2e.ts'], application: null, changed: false, held: true, e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath }],
  };
}

function runDir(): { dir: EvidencePath; run: RunId } {
  const run = newRunId();
  const dir = join(mkdtempSync(join(tmpdir(), 'verify-evidence-')), run) as EvidencePath;
  mkdirSync(join(dir, 'e2e'), { recursive: true });
  mkdirSync(join(dir, 'screenshots'), { recursive: true });
  writeFileSync(join(dir, 'video.mp4'), 'mp4');
  writeFileSync(join(dir, 'screenshots', 'profile.png'), 'png');
  writeFileSync(join(dir, 'app.log'), `log line\n${hostLogLine(null)}${hostLogLine(OWN_USER)}${hostLogLine(OWN_USER)}`);
  writeFileSync(join(dir, 'e2e', 'report.json'), '{}');
  return { dir, run };
}

describe('test identities', () => {
  it('mints and accepts only +clerk_test emails and 555-01xx phones', () => {
    const run = 'r20261002-141210-7c1e' as RunId;
    assert.equal(newTestEmail(run, 3), 'verify_r20261002_141210_7c1e_3+clerk_test@example.com');
    assert.throws(() => parseTestEmail('someone@example.com'), { code: 'NOT_TEST_IDENTITY' });
    assert.throws(() => parseTestEmail('verify_1@example.com'), { code: 'NOT_TEST_IDENTITY' });
    assert.equal(parseTestPhone('+1 (201) 555-0142'), '+12015550142');
    assert.throws(() => parseTestPhone('+1 201 555 0200'), { code: 'NOT_TEST_IDENTITY' });
  });
});

describe('sealEvidence', () => {
  it('writes a sealed run.json beside the evidence layout', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    for (const file of ['run.json', 'video.mp4', 'screenshots/profile.png', 'app.log', 'e2e/report.json']) {
      assert.ok(existsSync(join(dir, file)), file);
    }
    const written = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as EvidenceRecord;
    assert.equal(written.sealed, true);
    assert.deepEqual(written.tainted, []);
    assert.deepEqual(record, written);
  });

  it('marks a file holding a used secret as tainted without rewriting it', () => {
    const { dir, run } = runDir();
    const ticket = new Secret('ticket', 'tkt_planted_secret_value');
    const plain = ticket.use('launch-argument', (value) => value);
    writeFileSync(join(dir, 'e2e', 'report.json'), `{"label":"-verifySignInTicket ${plain}"}`);
    const record = sealEvidence(dir, partialRecord(dir, run));
    assert.deepEqual(record.tainted, [join(dir, 'e2e', 'report.json')]);
    assert.ok(readFileSync(join(dir, 'e2e', 'report.json'), 'utf8').includes(plain), 'sealing leaves e2e files as written');
    assert.throws(() => assertPublishable(record, [OWN_USER]), { code: 'EVIDENCE_UNSAFE', message: /secret/ });
  });
});

describe('assertPublishable', () => {
  it('passes a clean run whose app log names only its own users', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    assert.deepEqual(loggedUserIds(dir), [OWN_USER]);
    assert.equal(assertPublishable(record, loggedUserIds(dir)).run, run);
  });

  it('rejects a run whose app log names a user the run did not create', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    writeFileSync(join(dir, 'app.log'), `${hostLogLine(OWN_USER)}${hostLogLine('user_someone_else')}`);
    assert.throws(() => assertPublishable(record, loggedUserIds(dir)), { code: 'EVIDENCE_UNSAFE', message: /user_someone_else/ });
  });

  it('reads a user ID from a host line that has spaces around the colon', () => {
    const { dir } = runDir();
    writeFileSync(join(dir, 'app.log'), 'I ClerkVerify: verify {"signedIn": true, "userId" : "user_spaced", "v": 1}\n');
    assert.deepEqual(loggedUserIds(dir), ['user_spaced']);
  });

  it('reads no user from a run that kept no app log', () => {
    const { dir } = runDir();
    rmSync(join(dir, 'app.log'));
    assert.deepEqual(loggedUserIds(dir), []);
  });

  it('rejects a run with a failing spec', () => {
    const { dir, run } = runDir();
    const base = sealEvidence(dir, partialRecord(dir, run), []);
    const failing = { ...base, results: base.results.map((r) => ({ ...r, status: 'failed' as const })) };
    assert.throws(() => assertPublishable(failing, []), { code: 'EVIDENCE_UNSAFE', message: /failing/ });
  });
});

describe('the comment attach posts', () => {
  it('counts a test that passed only on a retry apart from the passed ones', () => {
    const { dir, run } = runDir();
    const base = partialRecord(dir, run);
    const record = sealEvidence(dir, { ...base, results: [base.results[0]!, { ...base.results[0]!, title: 'b', status: 'flaky', attempts: 2, error: 'tap failed' }] }, []);
    const body = commentBody(assertPublishable(record, [OWN_USER]));
    assert.match(body, /, 1 of 2 passed, 1 flaky \(passed only on a retry\)\.$/m);
    assert.match(body, /^- flaky: `specs\/explored\/a\.e2e\.ts` b$/m);
  });
});

describe('assertPublishable and the groups of a run', () => {
  it('rejects a run with a group that lost its settings or never invoked e2e, though every result passed', () => {
    const { dir, run } = runDir();
    const base = sealEvidence(dir, partialRecord(dir, run), []);
    const group = base.settings[0]!;
    const other = { ...group, label: 'auth_multi_factor.required_for_sign_up=true' };
    assert.throws(() => assertPublishable({ ...base, settings: [group, { ...other, held: false }] }, []), { code: 'EVIDENCE_UNSAFE', message: /1 group that did not run in full on its settings: auth_multi_factor\.required_for_sign_up=true/ });
    assert.throws(() => assertPublishable({ ...base, settings: [{ ...group, e2eReport: null }, other] }, []), { code: 'EVIDENCE_UNSAFE', message: /did not run in full on its settings: standard/ });
  });
});

describe('attach', () => {
  const host = { repo: 'clerk-ios', githubRepo: 'clerk/clerk-ios' } as HostAdapter;

  function recordingRunner(attachFlag = true): { runner: Runner; calls: (readonly string[])[] } {
    const calls: (readonly string[])[] = [];
    const runner: Runner = async (command, args) => {
      if (args.includes('--help')) return { code: 0, stdout: attachFlag ? '      --attach file   Attach a file\n' : '  -b, --body text   The comment body text\n', stderr: '' };
      calls.push([command, ...args]);
      return { code: 0, stdout: 'https://github.com/clerk/clerk-ios/pull/9#issuecomment-1\n', stderr: '' };
    };
    return { runner, calls };
  }

  it('never calls gh for a run that fails the gate', async () => {
    const skillDir = mkdtempSync(join(tmpdir(), 'verify-attach-'));
    const workspace = openWorkspace({ skillDir, worktree: skillDir, home: join(skillDir, 'home') });
    const { run, dir } = workspace.newRun();
    writeFileSync(join(dir, 'video.mp4'), 'x');
    writeFileSync(join(dir, 'app.log'), hostLogLine('user_foreign'));
    sealEvidence(dir, partialRecord(dir, run), []);
    const { runner, calls } = recordingRunner();
    const deps = { host, workspace, runner, env: {}, progress: () => undefined, instances: heldInstances() };
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, screenshots: 'all' }), { code: 'EVIDENCE_UNSAFE' });
    assert.equal(calls.length, 0);
  });

  it('posts once with --repo and --attach, then reports alreadyPosted', async () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    const publishable = assertPublishable(record, [OWN_USER]);
    const { runner, calls } = recordingRunner();
    const first = await postToPullRequest(publishable, dir, host, 9, 'all', runner);
    const second = await postToPullRequest(publishable, dir, host, 9, 'all', runner);
    assert.equal(calls.length, 1);
    const args = calls[0]!;
    assert.deepEqual(args.slice(0, 6), ['gh', 'pr', 'comment', '9', '--repo', 'clerk/clerk-ios']);
    assert.deepEqual(args.filter((_, i) => args[i - 1] === '--attach'), [join(dir, 'video.mp4'), join(dir, 'screenshots', 'profile.png')]);
    assert.equal(first.alreadyPosted, false);
    assert.equal(second.alreadyPosted, true);
    assert.equal(second.commentUrl, 'https://github.com/clerk/clerk-ios/pull/9#issuecomment-1');
    assert.ok(existsSync(join(dir, 'posted-9.json')));
    const other = await postToPullRequest(publishable, dir, host, 10, 'all', runner);
    assert.equal(other.alreadyPosted, false);
    assert.equal(calls.length, 2);
    assert.equal(calls[1]![3], '10');
  });

  it('posts nothing and names the fix when gh pr comment has no --attach', async () => {
    const { dir, run } = runDir();
    const publishable = assertPublishable(sealEvidence(dir, partialRecord(dir, run), []), [OWN_USER]);
    const { runner, calls } = recordingRunner(false);
    await assert.rejects(postToPullRequest(publishable, dir, host, 9, 'all', runner), {
      code: 'NOT_READY',
      message: `this gh has no \`gh pr comment --attach\`, so the video and screenshots of run ${run} cannot be posted`,
      fix: 'install a gh build whose `gh pr comment` has --attach',
    });
    assert.deepEqual(calls, []);
    assert.equal(existsSync(join(dir, 'posted-9.json')), false);
  });
});
