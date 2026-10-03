import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { newTestEmail, parseTestEmail, parseTestPhone } from '../src/core/clerk.ts';
import { assertPublishable, sealEvidence } from '../src/core/evidence.ts';
import type { Runner } from '../src/core/exec.ts';
import { postToPullRequest } from '../src/core/publish.ts';
import { Secret } from '../src/core/secret.ts';
import { parseVerifyState } from '../src/core/state.ts';
import { attach } from '../src/core/verbs.ts';
import { newRunId, openWorkspace } from '../src/core/workspace.ts';
import type { BuildKey, EvidencePath, EvidenceRecord, HostAdapter, RunId, VerifyState } from '../src/core/types.ts';

const OWN_USER = 'user_own';

function state(userId: string | null): VerifyState {
  return parseVerifyState(
    `verify {"environmentLoaded":true,"launchId":"l1","lastError":null,"orgId":null,"pendingTasks":[],"runId":"r","screen":"home","sessionId":null,"sessionStatus":"active","signInStatus":null,"signUpStatus":null,"signedIn":${userId !== null},"ticket":"succeeded","userId":${JSON.stringify(userId)},"v":1}`,
  );
}

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
    device: 'verify-ios-1',
    build: 'ios-000000000000' as BuildKey,
    results: [
      { spec: { kind: 'explored', path: 'specs/explored/a.e2e.ts', feature: null }, title: 'a', platform: 'ios', status: 'passed', seconds: 1, error: null, skipReason: null, tags: [], failurePage: null, failureScreen: null, failureScreenshot: null },
    ],
    videos: [join(dir, 'video.mp4') as EvidencePath],
    screenshots: [{ label: 'profile', path: join(dir, 'screenshots', 'profile.png') as EvidencePath }],
    lastState: state(OWN_USER),
    appLog: join(dir, 'app.log') as EvidencePath,
    e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath,
    identities: [{ email: newTestEmail(run, 1), userId: OWN_USER }],
  };
}

function runDir(): { dir: EvidencePath; run: RunId } {
  const run = newRunId();
  const dir = join(mkdtempSync(join(tmpdir(), 'verify-evidence-')), run) as EvidencePath;
  mkdirSync(join(dir, 'e2e'), { recursive: true });
  mkdirSync(join(dir, 'screenshots'), { recursive: true });
  writeFileSync(join(dir, 'video.mp4'), 'mp4');
  writeFileSync(join(dir, 'screenshots', 'profile.png'), 'png');
  writeFileSync(join(dir, 'app.log'), 'log line\n');
  writeFileSync(join(dir, 'e2e', 'report.json'), '{}');
  writeFileSync(join(dir, 'states.jsonl'), `${JSON.stringify(state(OWN_USER))}\n`);
  return { dir, run };
}

describe('test identities', () => {
  it('mints and accepts only +clerk_test emails and 555-01xx phones', () => {
    const run = 'r20261002-141210-7c1e' as RunId;
    assert.equal(newTestEmail(run, 3), 'verify_r20261002_141210_7c1e_3+clerk_test@example.com');
    assert.throws(() => parseTestEmail('mike@clerk.dev'), { code: 'NOT_TEST_IDENTITY' });
    assert.throws(() => parseTestEmail('verify_1@example.com'), { code: 'NOT_TEST_IDENTITY' });
    assert.equal(parseTestPhone('+1 (201) 555-0142'), '+12015550142');
    assert.throws(() => parseTestPhone('+1 201 555 0200'), { code: 'NOT_TEST_IDENTITY' });
  });
});

describe('sealEvidence', () => {
  it('writes a sealed run.json beside the evidence layout', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    for (const file of ['run.json', 'video.mp4', 'screenshots/profile.png', 'states.jsonl', 'app.log', 'e2e/report.json']) {
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
    assert.throws(() => assertPublishable(record, [state(OWN_USER)]), { code: 'EVIDENCE_UNSAFE', message: /secret/ });
  });
});

describe('assertPublishable', () => {
  it('passes a clean run whose states show only its own users', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    assert.equal(assertPublishable(record, [state(null), state(OWN_USER)]).run, run);
  });

  it('rejects a state with a user the run did not create', () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    assert.throws(() => assertPublishable(record, [state(OWN_USER), state('user_someone_else')]), { code: 'EVIDENCE_UNSAFE', message: /user_someone_else/ });
  });

  it('rejects a run with a non-test identity or a failing spec', () => {
    const { dir, run } = runDir();
    const base = sealEvidence(dir, partialRecord(dir, run), []);
    assert.throws(() => assertPublishable({ ...base, identities: [{ email: 'mike@clerk.dev' as never, userId: OWN_USER }] }, []), { code: 'NOT_TEST_IDENTITY' });
    const failing = { ...base, results: base.results.map((r) => ({ ...r, status: 'failed' as const })) };
    assert.throws(() => assertPublishable(failing, []), { code: 'EVIDENCE_UNSAFE', message: /failing/ });
  });
});

describe('attach', () => {
  const host = { repo: 'clerk-ios', githubRepo: 'clerk/clerk-ios' } as HostAdapter;

  function recordingRunner(): { runner: Runner; calls: (readonly string[])[] } {
    const calls: (readonly string[])[] = [];
    const runner: Runner = async (command, args) => {
      calls.push([command, ...args]);
      return { code: 0, stdout: 'https://github.com/clerk/clerk-ios/pull/9#issuecomment-1\n', stderr: '' };
    };
    return { runner, calls };
  }

  it('never calls gh for a run that fails the gate', async () => {
    const skillDir = mkdtempSync(join(tmpdir(), 'verify-attach-'));
    const workspace = openWorkspace({ skillDir, worktree: skillDir, home: join(skillDir, 'home') });
    const { run, dir } = workspace.newRun();
    for (const file of ['video.mp4', 'app.log']) writeFileSync(join(dir, file), 'x');
    sealEvidence(dir, partialRecord(dir, run), []);
    writeFileSync(join(dir, 'states.jsonl'), `${JSON.stringify(state('user_foreign'))}\n`);
    const { runner, calls } = recordingRunner();
    const deps = { host, workspace, runner, env: {}, progress: () => undefined, clerk: () => assert.fail('attach must not touch Clerk') };
    await assert.rejects(attach(deps, { verb: 'attach', run, pr: 9, screenshots: 'all' }), { code: 'EVIDENCE_UNSAFE' });
    assert.equal(calls.length, 0);
  });

  it('posts once with --repo and --attach, then reports alreadyPosted', async () => {
    const { dir, run } = runDir();
    const record = sealEvidence(dir, partialRecord(dir, run), []);
    const publishable = assertPublishable(record, [state(OWN_USER)]);
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
});
