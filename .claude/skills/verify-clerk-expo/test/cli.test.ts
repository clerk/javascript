import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createOutput, exitCodeFor, parseArgv } from '../src/core/cli.ts';
import { Secret } from '../src/core/secret.ts';
import { supportsNode } from '../src/core/launch.mjs';
import { VerifyFailure, type Command, type DoctorReport, type DownResult, type EvidencePath, type EvidenceRecord, type RunResult, type SpecResult } from '../src/core/types.ts';

function usageError(argv: readonly string[]): VerifyFailure {
  try {
    parseArgv(argv);
  } catch (error) {
    assert.ok(error instanceof VerifyFailure, `${argv.join(' ')} threw a non-VerifyFailure`);
    return error;
  }
  assert.fail(`${argv.join(' ')} parsed`);
}

describe('parseArgv', () => {
  it('parses every verb', () => {
    assert.deepEqual(parseArgv(['doctor']).command, { verb: 'doctor', live: false });
    assert.deepEqual(parseArgv(['doctor', '--platform', 'ios', '--backend', 'local']).command, { verb: 'doctor', platform: 'ios', backend: 'local', live: false });
    assert.deepEqual(parseArgv(['up', '--backend', 'auto']).command, { verb: 'up', waitSeconds: 0 });
    assert.throws(() => parseArgv(['up', '--backend', 'elsewhere']), /auto or local/);
    assert.deepEqual(parseArgv(['up', '--wait', '300']).command, { verb: 'up', waitSeconds: 300 });
    assert.deepEqual(parseArgv(['up']).command, { verb: 'up', waitSeconds: 0 });
    assert.deepEqual(parseArgv(['run', 'auth-start', 'sign-up/request-code']).command, {
      verb: 'run',
      selection: { selectors: ['auth-start', 'sign-up/request-code'] },
      video: true,
      retries: 0,
      githubReport: false,
      waitSeconds: 0,
    });
    assert.deepEqual(parseArgv(['run', '--all', '--no-video', '--grep', 'profile']).command, {
      verb: 'run',
      selection: { all: true },
      grep: 'profile',
      video: false,
      retries: 0,
      githubReport: false,
      waitSeconds: 0,
    });
    assert.equal((parseArgv(['run', 'auth-start', '--wait', '300']).command as { waitSeconds: number }).waitSeconds, 300);
    assert.equal((parseArgv(['run', '--all', '--retries', '1']).command as Extract<Command, { verb: 'run' }>).retries, 1);
    assert.equal((parseArgv(['run', '--all', '--github-report']).command as Extract<Command, { verb: 'run' }>).githubReport, true);
    for (const bad of ['-1', 'once']) assert.throws(() => parseArgv(['run', '--all', '--retries', bad]), { code: 'USAGE' }, bad);
    assert.deepEqual(parseArgv(['screen', '--png']).command, { verb: 'screen', png: true });
    assert.deepEqual(parseArgv(['attach', 'r20261002-141210-7c1e', '--pr', '412', '--screenshot', 'a', '--screenshot=b']).command, {
      verb: 'attach',
      run: 'r20261002-141210-7c1e',
      pr: 412,
      screenshots: ['a', 'b'],
    });
    assert.deepEqual(parseArgv(['attach', 'r20261002-141210-7c1e', '--pr=7']).command, { verb: 'attach', run: 'r20261002-141210-7c1e', pr: 7, screenshots: 'all' });
    assert.deepEqual(parseArgv(['down', '--stale', '--dry-run']).command, { verb: 'down', stale: true, dryRun: true });
  });

  it('reads --json on every verb', () => {
    for (const argv of [['doctor'], ['up'], ['run', 'x'], ['screen'], ['attach', 'r20261002-141210-7c1e', '--pr', '1'], ['down']]) {
      assert.equal(parseArgv([...argv, '--json']).json, true, argv[0]);
      assert.equal(parseArgv(argv).json, false, argv[0]);
    }
  });

  it('refuses unknown verbs, flags, and malformed values with USAGE', () => {
    for (const argv of [
      [],
      ['frobnicate'],
      ['Doctor'],
      ['doctor', '--wait', '3'],
      ['up', '--png'],
      ['run'],
      ['run', 'x', '--all'],
      ['run', 'x', '--video'],
      ['screen', 'extra'],
      ['attach', 'r20261002-141210-7c1e'],
      ['attach', 'not-a-run', '--pr', '1'],
      ['attach', 'r20261002-141210-7c1e', '--pr', 'abc'],
      ['down', '--platform', 'windows'],
      ['up', '--backend', 'cloud'],
      ['up', '--wait'],
    ]) {
      assert.equal(usageError(argv).code, 'USAGE', argv.join(' '));
    }
  });
});

describe('Output', () => {
  it('masks every value a secret was used with, in human and JSON output', () => {
    const sk = new Secret('clerk-secret-key', 'sk_test_unitTestValue123456');
    sk.use('bapi-authorization', () => undefined);
    let written = '';
    const sink = { write: (text: string) => (written += text) };
    const human = createOutput(false, '/tmp', 'bin/control-x', sink, sink);
    human.progress('calling with sk_test_unitTestValue123456 now');
    human.failure(new VerifyFailure('NOT_READY', 'header was Bearer sk_test_unitTestValue123456', 'retry'));
    const json = createOutput(true, '/tmp', 'bin/control-x', sink, sink);
    json.failure(new VerifyFailure('NOT_READY', 'sk_test_unitTestValue123456', 'retry'));
    assert.ok(!written.includes('sk_test_unitTestValue123456'), written);
    assert.equal(written.match(/<redacted>/g)?.length, 3);
    assert.equal(String(sk), '<secret:clerk-secret-key>');
    assert.equal(JSON.stringify({ sk }), '{"sk":"<secret:clerk-secret-key>"}');
  });

  it('prints one envelope under --json and keeps progress off stdout', () => {
    let out = '';
    let err = '';
    const output = createOutput(true, '/tmp', 'bin/control-x', { write: (t: string) => (out += t) }, { write: (t: string) => (err += t) });
    const report: DoctorReport = { verb: 'doctor', ok: false, backend: { ios: 'local' }, checks: [{ id: 'build', ok: false, detail: 'none', fix: '{cli} up' }] };
    output.progress('building');
    output.result(report);
    assert.equal(err, '');
    const parsed = JSON.parse(out) as { ok: boolean; checks: unknown[] };
    assert.equal(parsed.ok, false);
    assert.equal(parsed.checks.length, 1);
    assert.equal(exitCodeFor(report), 3);
  });
});

describe('run output', () => {
  const result = (status: SpecResult['status'], error: string): RunResult => ({
    verb: 'run',
    dir: '/tmp/runs/r20261002-141210-7c1e' as EvidencePath,
    next: 'next',
    record: {
      results: [
        { spec: { kind: 'golden', path: 'specs/golden/auth-start/opens.e2e.ts', feature: null }, title: 'opens', platform: 'ios', status: 'passed', seconds: 5, attempts: 1, error: null, skipReason: null, skippedBy: null, tags: [], failurePage: null, failureScreen: null, failureScreenshot: null },
        { spec: { kind: 'golden', path: 'specs/golden/sign-up/complete.e2e.ts', feature: null }, title: 'completes', platform: 'ios', status, seconds: 41.5, attempts: 2, error, skipReason: null, skippedBy: null, tags: [], failurePage: '/tmp/failures/complete.md' as EvidencePath, failureScreen: null, failureScreenshot: null },
      ],
      videos: [],
      screenshots: [],
      appLog: null,
      tainted: [],
    } as unknown as EvidenceRecord,
  });
  const printed = (value: RunResult): string => {
    let out = '';
    createOutput(false, '/tmp', 'bin/control-x', { write: (t: string) => (out += t) }, { write: () => {} }).result(value);
    return out;
  };

  it('prints a test that passed on a retry as flaky with the failed attempt, counts it, and does not fail the run', () => {
    const flaky = result('flaky', 'tap failed');
    const out = printed(flaky);
    assert.match(out, /^  flaky sign-up\/complete\.e2e\.ts +completes  41\.5s$/m);
    assert.match(out, /^ +passed on attempt 2; the attempt before it failed: tap failed$/m);
    assert.match(out, /^ +failure page  .*complete\.md$/m);
    assert.match(out, /^flaky     1 test passed only on a retry, and the run does not fail for it$/m);
    assert.doesNotMatch(out, /^  pass  sign-up/m);
    assert.equal(exitCodeFor(flaky), 0);
  });

  it('fails the run for a test that failed on every attempt', () => {
    const failed = result('failed', 'tap failed again');
    const out = printed(failed);
    assert.match(out, /^  FAIL  sign-up\/complete\.e2e\.ts +completes  41\.5s$/m);
    assert.match(out, /^ +tap failed again$/m);
    assert.doesNotMatch(out, /^flaky/m);
    assert.equal(exitCodeFor(failed), 1);
  });
});

describe('doctor output', () => {
  const report: DoctorReport = {
    verb: 'doctor',
    ok: true,
    backend: { ios: 'local' },
    checks: [
      { id: 'node', ok: true, detail: '24.15.0' },
      { id: 'gh-attach', ok: true, state: 'warning', detail: 'gh pr comment has no --attach', fix: 'install one that has' },
      { id: 'live-session', ok: true, state: 'not-run', detail: 'not run: needs --live' },
    ],
  };

  it('labels a warning and a check that was not run, and neither fails doctor', () => {
    let out = '';
    createOutput(false, '/tmp', 'bin/control-x', { write: (t: string) => (out += t) }, { write: () => true }).result(report);
    assert.deepEqual(out.trimEnd().split('\n'), ['ok    node          24.15.0', 'warn  gh-attach     gh pr comment has no --attach', '      fix: install one that has', 'skip  live-session  not run: needs --live']);
    assert.equal(exitCodeFor(report), 0);
  });

  it('carries the state of each check under --json', () => {
    let out = '';
    createOutput(true, '/tmp', 'bin/control-x', { write: (t: string) => (out += t) }, { write: () => true }).result(report);
    assert.deepEqual((JSON.parse(out) as DoctorReport).checks.map((c) => c.state ?? null), [null, 'warning', 'not-run']);
  });
});

describe('doctor node check', () => {
  it('accepts Node 24 from 24.8, which is the oldest 24 that the pinned e2e runs on', () => {
    assert.deepEqual(
      ['24.8.0', '24.15.0', '24.21.0'].map(supportsNode),
      [true, true, true],
    );
    assert.deepEqual(
      ['24.7.9', '24.0.0', '22.22.3', '25.0.0', '26.1.0'].map(supportsNode),
      [false, false, false, false, false],
    );
  });
});

describe('down output', () => {
  const text = (result: DownResult) => {
    let out = '';
    createOutput(false, '/tmp', 'bin/control-x', { write: (t: string) => (out += t) }, { write: () => true }).result(result);
    return out;
  };
  const render = (stoppedProcesses: readonly string[]) => text({ verb: 'down', dryRun: false, released: [], deletedApplications: [{ name: 'verify-throwaway-one' }], stoppedProcesses, keptRuns: [] });

  it('says a ledgered daemon had already exited instead of claiming none ran', () => {
    const out = render(['agent-device 4242 had already exited']);
    assert.match(out, /stopped   agent-device 4242 had already exited/);
    assert.doesNotMatch(out, /no agent-device daemon running/);
    assert.match(out, /deleted   1 application \(verify-throwaway-one, with every test user in it\)/);
  });

  it('names each application a dry run would delete', () => {
    const out = text({ verb: 'down', dryRun: true, wouldRelease: [], wouldDelete: [{ kind: 'application', name: 'verify-throwaway-one' }], wouldStop: [], keptRuns: [] });
    assert.match(out, /would delete   1 application\n  application   verify-throwaway-one  \(with every test user in it\)\n/);
  });

  it('says no daemon ran when the ledger had none', () => {
    assert.match(render([]), /stopped   nothing; no agent-device daemon running/);
  });
});

describe('the CLI name', () => {
  it('prints fixes, usage, and next hints with the host command, never a built-in name', () => {
    let out = '';
    const sink = { write: (t: string) => (out += t) };
    const output = createOutput(false, '/tmp', 'tools/bin/control-acme', sink, sink);
    output.failure(usageError(['run']));
    output.failure(new VerifyFailure('NOT_READY', 'no device is leased', '{cli} up'));
    output.progress('wait    another {cli} run in this worktree is driving the device');
    assert.match(out, /fix: tools\/bin\/control-acme up/);
    assert.match(out, /tools\/bin\/control-acme run <feature/);
    assert.match(out, /another tools\/bin\/control-acme run in this worktree/);
    output.failure(usageError(['doctor', '--wait', '3']));
    output.failure(usageError(['screen', 'extra']));
    assert.match(out, /tools\/bin\/control-acme doctor does not take --wait/);
    assert.match(out, /tools\/bin\/control-acme screen takes no arguments, got extra/);
    assert.doesNotMatch(out, /\{cli\}/);
    let json = '';
    createOutput(true, '/tmp', 'control-acme', { write: (t: string) => (json += t) }, sink).failure(new VerifyFailure('NOT_READY', 'x', '{cli} doctor'));
    assert.equal((JSON.parse(json) as { error: { fix: string } }).error.fix, 'control-acme doctor');
  });
});
