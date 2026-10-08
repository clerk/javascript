import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { heldInstances } from '../testing/fake-instances.ts';
import { createOutput } from '../src/core/cli.ts';
import { sealEvidence } from '../src/core/evidence.ts';
import { run as realRunner, type Runner } from '../src/core/exec.ts';
import { remoteBackend } from '../src/core/remote/backend.ts';
import type { GitHub } from '../src/core/remote/github.ts';
import { HANDOFF_LIMITS, HandoffRefused, evidenceReceiver, parseHandoffManifest, pullRequestMismatch, type HandoffManifest } from '../src/core/remote/handoff.ts';
import type { RemoteSettings } from '../src/core/remote/settings.ts';
import { attach, type Deps } from '../src/core/verbs.ts';
import { openWorkspace } from '../src/core/workspace.ts';
import { VerifyFailure, type BuildKey, type DeviceBackend, type EvidenceBundle, type EvidencePath, type EvidenceRecord, type HostAdapter, type Lease, type RemoteLease, type RunId } from '../src/core/types.ts';

const sha256 = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');
const COMMIT = '0f50b597b1c2d3e4f5a60718293a4b5c6d7e8f90';
const VIDEO = Buffer.from('a video that is longer than one chunk of five bytes');
const SHOT = Buffer.from('png bytes');

const good: HandoffManifest = {
  v: 1,
  pr: 669,
  run: 'r20261008-052713-253e',
  platform: 'ios',
  device: 'iPhone Air on xcode-27',
  commit: COMMIT,
  passed: 3,
  flaky: 0,
  total: 3,
  files: [
    { name: 'video.mp4', bytes: VIDEO.length, sha256: sha256(VIDEO) },
    { name: 'profile.png', bytes: SHOT.length, sha256: sha256(SHOT) },
  ],
};

describe('the hand-off manifest', () => {
  const parse = (change: Record<string, unknown>) => parseHandoffManifest(JSON.stringify({ ...good, ...change }));
  const file = (change: Record<string, unknown>) => parse({ files: [{ ...good.files[1]!, ...change }] });

  it('accepts a run with a video and screenshots', () => {
    assert.deepEqual(parseHandoffManifest(JSON.stringify(good)), good);
  });

  it('refuses a run with no file, which the publishing workflow refuses too', () => {
    assert.throws(() => parse({ files: [] }), /files must be a list of 1 to 50/);
  });

  it('refuses every field that is missing, malformed, or out of range', () => {
    const refused: readonly [string, () => unknown][] = [
      ['text that is not JSON', () => parseHandoffManifest('{')],
      ['a list', () => parseHandoffManifest('[]')],
      ['another version', () => parse({ v: 2 })],
      ['a key the schema does not have', () => parse({ note: 'free text' })],
      ['a missing key', () => parseHandoffManifest(JSON.stringify({ ...good, device: undefined }))],
      ['a run id of another shape', () => parse({ run: 'r20261008-052713-253e; rm -rf /' })],
      ['a PR number that is text', () => parse({ pr: '669' })],
      ['a PR number that is not whole', () => parse({ pr: 6.5 })],
      ['a PR number of zero', () => parse({ pr: 0 })],
      ['a third platform', () => parse({ platform: 'web' })],
      ['a device with markdown in it', () => parse({ device: 'iPhone `Air` [x](http://evil)' })],
      ['a short commit', () => parse({ commit: 'abc1234' })],
      ['a negative count', () => parse({ passed: -1 })],
      ['no passing test', () => parse({ passed: 0, flaky: 0 })],
      ['more passing tests than tests', () => parse({ passed: 4 })],
      ['files that are not a list', () => parse({ files: 'video.mp4' })],
      ['more files than the cap', () => parse({ files: Array.from({ length: HANDOFF_LIMITS.files + 1 }, (_, i) => ({ ...good.files[1]!, name: `s${i}.png` })) })],
      ['two videos', () => parse({ files: [good.files[0]!, { ...good.files[0]!, name: 'second.mp4' }] })],
      ['two files with one name', () => parse({ files: [good.files[1]!, { ...good.files[1]!, name: 'Profile.png' }] })],
      ['a name with a path separator', () => file({ name: '../profile.png' })],
      ['a name with a backslash', () => file({ name: 'a\\profile.png' })],
      ['a name that starts with a dot', () => file({ name: '.profile.png' })],
      ['a name that starts with a dash', () => file({ name: '-profile.png' })],
      ['a name with a space', () => file({ name: 'my profile.png' })],
      ['an extension outside png, jpg, mp4', () => file({ name: 'profile.svg' })],
      ['a name with no extension', () => file({ name: 'profile' })],
      ['a name that is too long', () => file({ name: `${'a'.repeat(120)}.png` })],
      ['an empty file', () => file({ bytes: 0 })],
      ['an image over its cap', () => file({ bytes: HANDOFF_LIMITS.imageBytes + 1 })],
      ['a video over its cap', () => parse({ files: [{ ...good.files[0]!, bytes: HANDOFF_LIMITS.videoBytes + 1 }] })],
      ['a sha256 of another shape', () => file({ sha256: 'abc' })],
      ['a file with a key the schema does not have', () => file({ path: '/etc/passwd' })],
      ['a manifest over its size cap', () => parseHandoffManifest(JSON.stringify(good).padEnd(HANDOFF_LIMITS.manifestBytes + 1, ' '))],
    ];
    for (const [what, attempt] of refused) assert.throws(attempt, HandoffRefused, what);
  });

  it('refuses files that are within their own caps and over the total', () => {
    const images = Array.from({ length: 6 }, (_, i) => ({ name: `s${i}.png`, bytes: HANDOFF_LIMITS.imageBytes, sha256: sha256('x') }));
    assert.throws(() => parse({ files: [{ ...good.files[0]!, bytes: HANDOFF_LIMITS.videoBytes }, ...images] }), /over 157286400 bytes in all/);
  });
});

describe('the rule for which pull request a session may publish to', () => {
  const STARTED_ON = 'd'.repeat(40);
  const session = { repo: 'clerk/clerk-ios', headBranch: 'feature/change', startedOn: STARTED_ON, runCommit: COMMIT };
  const pull = { state: 'open', headRepo: 'clerk/clerk-ios', headRef: 'feature/change', commits: [STARTED_ON, COMMIT], commitCount: 2 };
  const why = (...asked: Parameters<typeof pullRequestMismatch>): string | undefined => pullRequestMismatch(...asked)?.why;

  it('accepts the open pull request of the session branch that holds the commit the session started on and the commit of the run', () => {
    assert.equal(pullRequestMismatch(pull, session), null);
    assert.equal(pullRequestMismatch({ ...pull, commits: [COMMIT] }, { ...session, startedOn: COMMIT }), null, 'a run at the commit the session started on');
  });

  it('accepts a pull request that has newer commits than the run', () => {
    assert.equal(pullRequestMismatch({ ...pull, commits: [STARTED_ON, COMMIT, 'b'.repeat(40)] }, session), null);
  });

  it('refuses a closed one, a fork, another branch, and one that lacks either commit, and says which', () => {
    assert.equal(why({ ...pull, state: 'closed' }, session), 'it is closed');
    assert.equal(why({ ...pull, headRepo: 'someone/clerk-ios' }, session), 'its branch is in someone/clerk-ios, not in clerk/clerk-ios');
    assert.equal(why({ ...pull, headRepo: null }, session), 'its branch is in a deleted fork, not in clerk/clerk-ios');
    assert.equal(why({ ...pull, headRef: 'main' }, session), 'its branch is main and the session runs on feature/change');
    assert.equal(why({ ...pull, commits: [COMMIT] }, session), 'the session started on dddddddddddd, which is not one of its commits');
    assert.equal(why({ ...pull, commits: [STARTED_ON] }, session), 'the run was made at 0f50b597b1c2, which is not one of its commits');
  });

  it('says that GitHub lists only the first 250 commits when a longer pull request does not show a commit, and gives a fix that can change that', () => {
    const listed = Array.from({ length: 250 }, (_, i) => i.toString(16).padStart(40, '0'));
    const long = { ...pull, commits: listed, commitCount: 300 };
    const refused = pullRequestMismatch(long, session);
    assert.equal(refused?.why, 'it has 300 commits, GitHub lists only the first 250, and the session started on dddddddddddd, which is not among those');
    assert.match(refused?.fix ?? '', /squash or rebase the branch to 250 commits or fewer, .* or run \{cli\} attach on a machine whose gh can attach$/);
    assert.equal(why({ ...long, commits: [STARTED_ON, ...listed.slice(1)] }, session), 'it has 300 commits, GitHub lists only the first 250, and the run was made at 0f50b597b1c2, which is not among those');
    assert.equal(pullRequestMismatch({ ...long, commits: [STARTED_ON, COMMIT, ...listed.slice(2)] }, session), null, 'both commits are among the first 250');
    const short = pullRequestMismatch({ ...long, commitCount: 250 }, session);
    assert.equal(short?.why, 'the session started on dddddddddddd, which is not one of its commits');
    assert.notEqual(short?.fix, refused?.fix);
  });
});

describe('the receiver in the session job', () => {
  const chunk = (name: string, offset: number, data: Buffer) => JSON.stringify({ name, offset, data: data.toString('base64') });
  const status = (attempt: () => unknown): number => {
    try {
      attempt();
    } catch (error) {
      if (error instanceof HandoffRefused) return error.status;
      throw error;
    }
    return 200;
  };

  function received() {
    const work = mkdtempSync(join(tmpdir(), 'verify-handoff-'));
    writeFileSync(join(work, 'agent.log'), 'the session agent keeps other files here');
    const receiver = evidenceReceiver(work);
    receiver.begin(JSON.stringify(good));
    return { work, receiver };
  }

  it('keeps the manifest and the files in one directory, and only once every file is whole', () => {
    const { work, receiver } = received();
    receiver.chunk(chunk('video.mp4', 0, VIDEO.subarray(0, 20)));
    assert.equal(existsSync(join(work, 'evidence')), false, 'a hand-off in progress is not what the job uploads');
    assert.equal(receiver.held(), null);
    assert.throws(() => receiver.commit(), (error: HandoffRefused) => error.status === 409 && error.message === `video.mp4 has 20 of ${VIDEO.length} bytes`, 'a commit with bytes missing is refused');
    assert.deepEqual(receiver.chunk(chunk('video.mp4', 20, VIDEO.subarray(20))), { ok: true, bytes: VIDEO.length });
    receiver.chunk(chunk('profile.png', 0, SHOT));
    assert.deepEqual(receiver.commit(), { ok: true, run: good.run, files: 2, bytes: VIDEO.length + SHOT.length });
    assert.deepEqual(readdirSync(work).sort(), ['agent.log', 'evidence']);
    assert.deepEqual(readdirSync(join(work, 'evidence')).sort(), ['manifest.json', 'profile.png', 'video.mp4']);
    assert.deepEqual(readFileSync(join(work, 'evidence', 'video.mp4')), VIDEO);
    assert.deepEqual(JSON.parse(readFileSync(join(work, 'evidence', 'manifest.json'), 'utf8')), good);
    assert.equal(receiver.held(), good.run);
  });

  it('refuses a chunk for a file the manifest does not name, so no request chooses a path', () => {
    const { work, receiver } = received();
    for (const name of ['../agent.log', '/etc/passwd', 'other.png', 'manifest.json']) assert.equal(status(() => receiver.chunk(chunk(name, 0, SHOT))), 400, name);
    assert.equal(readFileSync(join(work, 'agent.log'), 'utf8'), 'the session agent keeps other files here');
    assert.deepEqual(readdirSync(join(work, 'evidence.partial')), ['manifest.json']);
  });

  it('takes a file in order only, and tells a sender that repeats a chunk how much it has', () => {
    const { receiver } = received();
    receiver.chunk(chunk('video.mp4', 0, VIDEO.subarray(0, 20)));
    assert.throws(() => receiver.chunk(chunk('video.mp4', 0, VIDEO.subarray(0, 20))), (error: HandoffRefused) => error.status === 409 && error.have === 20);
    assert.equal(status(() => receiver.chunk(chunk('video.mp4', 30, VIDEO.subarray(30)))), 409);
  });

  it('refuses bytes past the size the manifest declares, a chunk over the chunk cap, and a body over the body cap', () => {
    const { receiver } = received();
    assert.equal(status(() => receiver.chunk(chunk('profile.png', 0, Buffer.concat([SHOT, SHOT])))), 413);
    const large = evidenceReceiver(mkdtempSync(join(tmpdir(), 'verify-handoff-')));
    large.begin(JSON.stringify({ ...good, files: [{ ...good.files[0]!, bytes: 4 * HANDOFF_LIMITS.chunkBytes }] }));
    assert.throws(() => large.chunk(chunk('video.mp4', 0, Buffer.alloc(HANDOFF_LIMITS.chunkBytes + 1))), (error: HandoffRefused) => error.status === 413 && error.message === 'a chunk holds 1 to 1048576 bytes');
    assert.deepEqual(large.chunk(chunk('video.mp4', 0, Buffer.alloc(HANDOFF_LIMITS.chunkBytes))), { ok: true, bytes: HANDOFF_LIMITS.chunkBytes });
    assert.equal(status(() => receiver.chunk(null)), 413, 'the agent passes null for a body it stopped reading at the cap');
    assert.equal(status(() => evidenceReceiver(mkdtempSync(join(tmpdir(), 'verify-handoff-'))).begin(null)), 413);
  });

  it('refuses a chunk that is not the JSON it expects', () => {
    const { receiver } = received();
    for (const body of ['not json', '[]', JSON.stringify({ name: 'profile.png', offset: 0 }), JSON.stringify({ name: 'profile.png', offset: 0, data: 'not base64 !' }), JSON.stringify({ name: 'profile.png', offset: 0, data: '' })]) {
      assert.equal(status(() => receiver.chunk(body)), 400, body);
    }
  });

  it('refuses to commit bytes that do not have the sha256 the manifest declares', () => {
    const { work, receiver } = received();
    receiver.chunk(chunk('video.mp4', 0, VIDEO));
    receiver.chunk(chunk('profile.png', 0, Buffer.from('PNG BYTES')));
    assert.equal(status(() => receiver.commit()), 409);
    assert.equal(existsSync(join(work, 'evidence')), false);
  });

  it('replaces an earlier hand-off with a later one, and refuses a manifest that does not parse', () => {
    const { work, receiver } = received();
    receiver.chunk(chunk('video.mp4', 0, VIDEO));
    receiver.chunk(chunk('profile.png', 0, SHOT));
    receiver.commit();
    assert.equal(status(() => receiver.begin(JSON.stringify({ ...good, run: 'nope' }))), 400);
    assert.equal(receiver.held(), good.run, 'a refused manifest leaves the kept hand-off alone');
    const later = { ...good, run: 'r20261008-060000-aaaa', files: [good.files[1]!] };
    receiver.begin(JSON.stringify(later));
    receiver.chunk(chunk('profile.png', 0, SHOT));
    receiver.commit();
    assert.deepEqual(readdirSync(join(work, 'evidence')).sort(), ['manifest.json', 'profile.png']);
    assert.equal(receiver.held(), later.run);
    assert.equal(status(() => receiver.chunk(chunk('profile.png', 0, SHOT))), 409, 'nothing is appended after a commit');
  });
});

const LEASE: RemoteLease = { backend: 'remote', provider: 'github-actions', platform: 'ios', session: 'ios0000aa', providerRef: '37731397352', baseUrl: 'https://session.trycloudflare.com', tokenFile: '', deviceId: 'UDID', deviceName: 'iPhone Air', runner: 'xcode-27', expiresAt: '2026-10-08T06:00:00Z', builtSha: COMMIT, acquiredAt: '2026-10-08T05:00:00.000Z', installedBuild: null };

function remoteRun(options: { readonly backend?: EvidenceRecord['backend']; readonly lease?: Lease | null; readonly startedAt?: string; readonly handOff?: DeviceBackend['handOffEvidence'] | null; readonly gh?: (args: readonly string[]) => { readonly code: number; readonly stdout: string; readonly stderr: string } } = {}) {
  const packageDir = mkdtempSync(join(tmpdir(), 'verify-handoff-verb-'));
  const workspace = openWorkspace({ packageDir, worktree: packageDir, home: join(packageDir, 'home') });
  const { run, dir } = workspace.newRun();
  mkdirSync(join(dir, 'screenshots'));
  writeFileSync(join(dir, 'video.mp4'), VIDEO);
  writeFileSync(join(dir, 'screenshots', 'profile.png'), SHOT);
  const backend = options.backend ?? 'remote';
  sealEvidence(
    dir,
    {
      run,
      startedAt: options.startedAt ?? '2026-10-08T05:27:13.000Z',
      finishedAt: '2026-10-08T05:30:00.000Z',
      repo: 'clerk-ios',
      gitHead: COMMIT,
      dirty: false,
      platform: 'ios',
      backend,
      remote: backend === 'remote' ? { provider: 'github-actions', runner: 'xcode-27', builtSha: COMMIT } : null,
      device: 'iPhone Air on xcode-27',
      build: 'ios-000000000000' as BuildKey,
      results: [{ spec: { kind: 'explored', path: 'specs/explored/a.e2e.ts', feature: null }, title: 'a', platform: 'ios', status: 'passed', seconds: 1, attempts: 1, error: null, skipReason: null, skippedBy: null, tags: [], failurePage: null, failureScreen: null, failureScreenshot: null }],
      videos: [join(dir, 'video.mp4') as EvidencePath],
      screenshots: [{ label: 'profile', path: join(dir, 'screenshots', 'profile.png') as EvidencePath }],
      appLog: null,
      e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath,
      identities: [],
      settings: [{ label: 'standard', askedBy: null, specs: ['specs/explored/a.e2e.ts'], application: null, changed: false, held: true, e2eReport: join(dir, 'e2e', 'report.json') as EvidencePath }],
    },
    [],
  );
  if (options.lease !== null) workspace.writeLease(options.lease ?? { ...LEASE, tokenFile: join(packageDir, 'token') });
  const bundles: EvidenceBundle[] = [];
  const handOffEvidence: DeviceBackend['handOffEvidence'] = options.handOff === undefined ? async (_lease, bundle) => (bundles.push(bundle), { sessionRun: '37731397352', sessionRunUrl: 'https://github.com/clerk/clerk-ios/actions/runs/37731397352' }) : (options.handOff ?? undefined);
  const remote = { kind: 'remote', platform: 'ios', ...(handOffEvidence === undefined ? {} : { handOffEvidence }) } as unknown as DeviceBackend;
  const host = { repo: 'clerk-ios', githubRepo: 'clerk/clerk-ios', backends: [remote] } as unknown as HostAdapter;
  const ghCalls: string[] = [];
  const gh = options.gh ?? (() => ({ code: 0, stdout: '  -b, --body text   Set the new body.\n', stderr: '' }));
  const runner: Runner = async (_command, args) => (ghCalls.push(args.slice(0, 2).join(' ') === 'pr edit' && !args.includes('--help') ? 'pr edit --attach' : args.slice(0, 3).join(' ')), gh(args));
  const deps: Deps = { host, workspace, runner, env: {}, progress: () => undefined, instances: heldInstances() };
  return { deps, run, dir, bundles, ghCalls };
}

describe('attach on a machine whose gh cannot attach', () => {
  it('hands the sealed files of a borrowed-device run to the session, and says what happens next', async () => {
    const { deps, run, dir, bundles, ghCalls } = remoteRun();
    const result = await attach(deps, { verb: 'attach', run, pr: 669, screenshots: 'all' });
    assert.deepEqual(ghCalls, ['pr edit --help'], 'gh was asked first, and it cannot attach');
    assert.deepEqual(bundles, [
      {
        pr: 669,
        summary: { run, platform: 'ios', device: 'iPhone Air on xcode-27', commit: COMMIT, passed: 1, flaky: 0, total: 1 },
        files: [
          { name: 'video.mp4', path: join(dir, 'video.mp4') },
          { name: 'profile.png', path: join(dir, 'screenshots', 'profile.png') },
        ],
      },
    ]);
    assert.deepEqual(result, {
      verb: 'attach',
      via: 'runner',
      pr: 669,
      handedOff: [join(dir, 'video.mp4'), join(dir, 'screenshots', 'profile.png')],
      because: 'this gh has no `gh pr edit --attach`',
      sessionRun: '37731397352',
      sessionRunUrl: 'https://github.com/clerk/clerk-ios/actions/runs/37731397352',
    });
    let out = '';
    createOutput(false, '/tmp', 'bin/control-x', { write: (text: string) => (out += text) }, { write: () => true }).result(result);
    assert.deepEqual(out.trimEnd().split('\n'), [
      "handed off  video.mp4, profile.png  to the session's runner (https://github.com/clerk/clerk-ios/actions/runs/37731397352), because this gh has no `gh pr edit --attach`",
      'next        bin/control-x down ends the session; the verify-attach workflow then puts the evidence in the description of PR #669',
    ]);
  });

  const ghThatHasAttach = (edit: { readonly code: number; readonly stdout: string; readonly stderr: string }, view = { code: 0, stdout: JSON.stringify({ body: 'A description.\n', url: 'https://github.com/clerk/clerk-ios/pull/669' }), stderr: '' }) => (args: readonly string[]) => {
    if (args.includes('--help')) return { code: 0, stdout: '      --attach file   Attach a file\n', stderr: '' };
    return args[1] === 'view' ? view : edit;
  };

  it('tries gh pr edit --attach itself first for a borrowed-device run, and hands nothing off when that works', async () => {
    const { deps, run, dir, bundles, ghCalls } = remoteRun({ gh: ghThatHasAttach({ code: 0, stdout: 'https://github.com/clerk/clerk-ios/pull/669\n', stderr: '' }) });
    const result = await attach(deps, { verb: 'attach', run, pr: 669, screenshots: 'all' });
    assert.deepEqual(result, { verb: 'attach', via: 'gh', prUrl: 'https://github.com/clerk/clerk-ios/pull/669', posted: [join(dir, 'video.mp4'), join(dir, 'screenshots', 'profile.png')], alreadyPosted: false });
    assert.deepEqual(ghCalls, ['pr edit --help', 'pr view 669', 'pr view 669', 'pr edit --attach']);
    assert.deepEqual(bundles, [], 'nothing went to the session');
  });

  it('hands off only after its own gh pr edit --attach was tried and refused, as a sandbox proxy refuses an upload', async () => {
    const order: string[] = [];
    const refusedUpload = ghThatHasAttach({ code: 1, stdout: '', stderr: '415 Request bodies must declare Content-Type: application/json\n' });
    const { deps, run, ghCalls } = remoteRun({
      gh: (args) => (order.push(args.includes('--attach') ? 'gh pr edit --attach' : 'gh'), refusedUpload(args)),
      handOff: async () => (order.push('hand-off'), { sessionRun: '1', sessionRunUrl: 'https://github.com/clerk/clerk-ios/actions/runs/1' }),
    });
    const result = await attach(deps, { verb: 'attach', run, pr: 669, screenshots: 'all' });
    assert.equal(result.via === 'runner' && result.because, 'gh pr edit failed');
    assert.equal(ghCalls.at(-1), 'pr edit --attach');
    assert.deepEqual(order.slice(-2), ['gh pr edit --attach', 'hand-off']);
  });

  it('hands off when gh cannot read the pull request, as it cannot where GraphQL is blocked', async () => {
    const { deps, run, bundles, ghCalls } = remoteRun({ gh: ghThatHasAttach({ code: 0, stdout: '', stderr: '' }, { code: 1, stdout: '', stderr: 'GraphQL: blocked\n' }) });
    const result = await attach(deps, { verb: 'attach', run, pr: 669, screenshots: 'all' });
    assert.equal(result.via === 'runner' && result.because, 'gh pr view failed');
    assert.deepEqual(ghCalls, ['pr edit --help', 'pr view 669']);
    assert.equal(bundles.length, 1);
  });

  it('hands off only the screenshots that were asked for', async () => {
    const { deps, run, bundles } = remoteRun();
    await attach(deps, { verb: 'attach', run, pr: 669, screenshots: [] });
    assert.deepEqual(bundles[0]!.files.map((file) => file.name), ['video.mp4']);
  });

  const failure = async (deps: Deps, run: RunId): Promise<VerifyFailure> => {
    try {
      await attach(deps, { verb: 'attach', run, pr: 669, screenshots: 'all' });
    } catch (error) {
      if (error instanceof VerifyFailure) return error;
      throw error;
    }
    throw new Error('attach did not fail');
  };

  it('says that the session is gone, and to name the run in the PR', async () => {
    const { deps, run, bundles } = remoteRun({ lease: null });
    const error = await failure(deps, run);
    assert.equal(error.message, `this gh has no \`gh pr edit --attach\`, so the video and screenshots of run ${run} cannot be posted, and this worktree holds no session now, so nothing can take the evidence to a runner`);
    assert.equal(error.fix, `name run ${run} in the PR and say that the evidence was not attached; to attach it, {cli} run again and {cli} attach before {cli} down`);
    assert.deepEqual(bundles, []);
  });

  it('does not hand a remote run to the local device that the worktree holds now', async () => {
    const local: Lease = { backend: 'local', platform: 'ios', slot: 1, deviceName: 'verify-ios-1', deviceId: 'UDID', claimNonce: 'n', acquiredAt: '2026-10-08T05:00:00.000Z', installedBuild: null };
    const { deps, run, bundles } = remoteRun({ lease: local });
    assert.match((await failure(deps, run)).message, /this worktree holds no session now, so nothing can take the evidence to a runner$/);
    assert.deepEqual(bundles, []);
  });

  it('does not hand a run to a session that started after it', async () => {
    const { deps, run, bundles } = remoteRun({ startedAt: '2026-10-08T04:00:00.000Z' });
    assert.match((await failure(deps, run)).message, /ran before the session that is up now started$/);
    assert.deepEqual(bundles, []);
  });

  it('says why a hand-off failed, and still to name the run in the PR', async () => {
    const { deps, run } = remoteRun({ handOff: async () => { throw new VerifyFailure('NOT_READY', 'the hand-off failed: 502', 'run {cli} attach again while the session is up'); } });
    const error = await failure(deps, run);
    assert.match(error.message, /cannot be posted, and the hand-off failed: 502$/);
    assert.equal(error.fix, `run {cli} attach again while the session is up; until then, name run ${run} in the PR and say that the evidence was not attached`);
  });

  it('keeps the plain failure for a run on a local device, which has no session', async () => {
    const { deps, run, bundles } = remoteRun({ backend: 'local' });
    const error = await failure(deps, run);
    assert.equal(error.message, `this gh has no \`gh pr edit --attach\`, so the video and screenshots of run ${run} cannot be posted`);
    assert.equal(error.fix, 'install gh 2.99.0 or newer, whose `gh pr edit` has --attach');
    assert.deepEqual(bundles, []);
  });
});

describe('the remote backend before it sends evidence', () => {
  const settings: RemoteSettings = { platform: 'ios', repo: 'clerk/clerk-ios', workflow: 'verify-remote.yml', sessionsDir: '/nonexistent', runner: 'xcode-27', plumbingRunner: 'ubuntu-latest', device: 'iPhone Air', idleMinutes: 15, capMinutes: 60, requirement: 'a pushed branch' };
  const STARTED_ON = 'd'.repeat(40);
  const OPEN = { state: 'open', body: '## Summary\r\n\r\nFixes the button.\r\n', head: { ref: 'feature/change', sha: COMMIT, repo: { full_name: 'clerk/clerk-ios' } } };

  interface Case {
    readonly pull?: unknown;
    readonly commits?: readonly string[];
    readonly health?: unknown;
    readonly files?: EvidenceBundle['files'];
  }

  async function handOff(options: Case = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'verify-handoff-backend-'));
    writeFileSync(join(dir, 'token'), 'b'.repeat(64));
    writeFileSync(join(dir, 'video.mp4'), VIDEO);
    const bundle: EvidenceBundle = {
      pr: 669,
      summary: { run: good.run as RunId, platform: 'ios', device: good.device, commit: COMMIT, passed: 3, flaky: 0, total: 3 },
      files: options.files ?? [{ name: 'video.mp4', path: join(dir, 'video.mp4') as EvidencePath }],
    };
    const commits = options.commits ?? [STARTED_ON, COMMIT];
    const asked: string[] = [];
    const hub: GitHub = {
      repo: settings.repo,
      workflow: settings.workflow,
      tokenSource: 'none',
      api: async (_method, path) => {
        asked.push(path);
        const page = /^\/pulls\/669\/commits\?per_page=100&page=(\d+)$/.exec(path);
        if (page !== null) return { status: 200, json: commits.slice((Number(page[1]) - 1) * 100, Number(page[1]) * 100).map((sha) => ({ sha })), headers: new Headers() };
        return { status: 200, json: path.startsWith('/pulls/') ? (options.pull ?? OPEN) : { head_branch: 'feature/change', head_sha: STARTED_ON }, headers: new Headers() };
      },
    };
    const sent: string[] = [];
    const health = options.health === undefined ? { ending: null } : options.health;
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      const path = new URL(String(input)).pathname;
      if (path === '/__sim/health') return health === null ? new Response('gone', { status: 502 }) : Response.json(health);
      sent.push(path);
      return Response.json({ ok: true });
    };
    try {
      const receipt = await remoteBackend(settings, { env: {}, runner: realRunner, github: async () => hub }).handOffEvidence!({ ...LEASE, tokenFile: join(dir, 'token') }, bundle, () => undefined);
      return { receipt, error: null, sent, asked };
    } catch (error) {
      if (error instanceof VerifyFailure) return { receipt: null, error, sent, asked };
      throw error;
    } finally {
      globalThis.fetch = realFetch;
    }
  }

  const refusal = async (options: Case): Promise<{ readonly error: VerifyFailure; readonly sent: readonly string[] }> => {
    const { error, sent } = await handOff(options);
    assert.ok(error !== null, 'the hand-off was not refused');
    return { error, sent };
  };
  const wouldNot = `the verify-attach workflow would not put the evidence of run ${good.run} on PR #669: `;

  it('sends a run made after a push in the same session, though the session started on an earlier commit', async () => {
    const { receipt, sent } = await handOff();
    assert.deepEqual(sent, ['/__sim/evidence/begin', '/__sim/evidence/chunk', '/__sim/evidence/commit']);
    assert.deepEqual(receipt, { sessionRun: '37731397352', sessionRunUrl: 'https://github.com/clerk/clerk-ios/actions/runs/37731397352' });
  });

  it('sends a run whose pull request has moved on to newer commits', async () => {
    const newer = 'b'.repeat(40);
    const { error, sent } = await handOff({ pull: { ...OPEN, head: { ...OPEN.head, sha: newer } }, commits: [STARTED_ON, COMMIT, newer] });
    assert.equal(error, null);
    assert.deepEqual(sent, ['/__sim/evidence/begin', '/__sim/evidence/chunk', '/__sim/evidence/commit']);
  });

  it('sends nothing for a pull request the publishing workflow would refuse, and says which rule', async () => {
    const fork = await refusal({ pull: { ...OPEN, head: { ...OPEN.head, repo: { full_name: 'someone/clerk-ios' } } } });
    assert.equal(fork.error.code, 'NOT_READY');
    assert.equal(fork.error.message, `${wouldNot}its branch is in someone/clerk-ios, not in clerk/clerk-ios`);
    assert.deepEqual(fork.sent, []);
    const closed = await refusal({ pull: { ...OPEN, state: 'closed' } });
    assert.equal(closed.error.message, `${wouldNot}it is closed`);
    assert.deepEqual(closed.sent, []);
  });

  it('sends nothing when the commit the session started on, or the commit of the run, is not a commit of the pull request', async () => {
    const rewritten = await refusal({ commits: ['e'.repeat(40), COMMIT] });
    assert.equal(rewritten.error.message, `${wouldNot}the session started on dddddddddddd, which is not one of its commits`);
    assert.match(rewritten.error.fix, /git push, then \{cli\} run again and attach, or after a rewrite of the branch's history \{cli\} down and \{cli\} up first$/);
    assert.deepEqual(rewritten.sent, []);
    const unpushed = await refusal({ commits: [STARTED_ON, 'e'.repeat(40)] });
    assert.equal(unpushed.error.message, `${wouldNot}the run was made at 0f50b597b1c2, which is not one of its commits`);
    assert.deepEqual(unpushed.sent, []);
  });

  it('finds the commit the session started on in a later page of a long pull request', async () => {
    const many = Array.from({ length: 230 }, (_, i) => i.toString(16).padStart(40, '0'));
    const found = await handOff({ commits: [...many, STARTED_ON, COMMIT] });
    assert.equal(found.error, null);
    assert.equal(found.asked.filter((path) => path.includes('/commits?')).length, 3);
    assert.equal((await handOff()).asked.filter((path) => path.includes('/commits?')).length, 1);
  });

  it('sends nothing for a pull request with more commits than GitHub lists when the commits of the run are past the listing, and does not say to start a new session', async () => {
    const listed = Array.from({ length: 250 }, (_, i) => i.toString(16).padStart(40, '0'));
    const long = await refusal({ pull: { ...OPEN, commits: 300 }, commits: listed });
    assert.equal(long.error.message, `${wouldNot}it has 300 commits, GitHub lists only the first 250, and the session started on dddddddddddd, which is not among those`);
    assert.match(long.error.fix, /squash or rebase the branch to 250 commits or fewer/);
    assert.deepEqual(long.sent, []);
  });

  it('sends nothing when the description ends inside a code fence that never closes, as the workflow would refuse it', async () => {
    const unclosed = await refusal({ pull: { ...OPEN, body: 'How to run it:\r\n\r\n```sh\r\nmake test\r\n' } });
    assert.equal(unclosed.error.message, `${wouldNot}its description ends inside a code fence that is never closed, so the evidence has no one place to go`);
    assert.equal(unclosed.error.fix, 'close that code fence, then rerun {cli} attach');
    assert.deepEqual(unclosed.sent, []);
  });

  it('sends nothing when the markers in the description would make the workflow refuse, and says which', async () => {
    const halved = await refusal({ pull: { ...OPEN, body: 'text\r\n<!-- verify-evidence:ios -->\r\nthe end marker was deleted\r\n' } });
    assert.equal(halved.error.message, `${wouldNot}its description has \`<!-- verify-evidence:ios -->\` 1 times and \`<!-- /verify-evidence:ios -->\` 0 times, so the evidence has no one place to go`);
    assert.equal(halved.error.fix, 'leave one pair of those markers in the description, or none, then rerun {cli} attach');
    assert.deepEqual(halved.sent, []);
    const notes = await refusal({ pull: { ...OPEN, body: '<!-- verify-evidence:ios -->\nreviewer notes\n<!-- /verify-evidence:ios -->\n' } });
    assert.match(notes.error.message, /that is not an evidence block, so the evidence has no one place to go$/);
    assert.equal((await handOff({ pull: { ...OPEN, body: null } })).error, null, 'a pull request with no description takes the block');
  });

  it('sends nothing for a run with no video and no screenshot', async () => {
    const empty = await refusal({ files: [] });
    assert.equal(empty.error.message, `${wouldNot}the run has no video and no screenshot, and the workflow publishes nothing without a file`);
    assert.deepEqual(empty.sent, []);
  });

  it('says that the session is gone when it does not answer or is ending', async () => {
    const gone = await refusal({ health: null });
    assert.equal(gone.error.code, 'LEASE_LOST');
    assert.match(gone.error.message, /does not answer, so it cannot take the evidence of run r20261008-052713-253e$/);
    assert.match((await refusal({ health: { ending: 'idle' } })).error.message, /is ending, so it cannot take the evidence/);
    assert.deepEqual(gone.sent, []);
  });
});
