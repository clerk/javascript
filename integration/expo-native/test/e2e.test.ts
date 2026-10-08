import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { collectScreenshots, e2eOutputDir, parseE2EReport, planE2E, resolveSpecs } from '../src/core/e2e.ts';
import { manifestDrift } from '../src/core/manifest.ts';
import type { EvidencePath, SpecRef } from '../src/core/types.ts';
import { SAMPLE_INPUTS } from '../testing/sample-inputs.ts';

function packageDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'verify-specs-'));
  for (const file of ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/sign-up/request-code.e2e.ts', 'specs/explored/probe.e2e.ts', 'specs/fixtures.ts']) {
    mkdirSync(join(dir, file, '..'), { recursive: true });
    writeFileSync(join(dir, file), '');
  }
  return dir;
}

describe('resolveSpecs', () => {
  it('expands features, feature/spec, paths, and --all', () => {
    const dir = packageDir();
    assert.deepEqual(resolveSpecs(dir, { selectors: ['auth-start'] }), [{ kind: 'golden', path: 'specs/golden/auth-start/opens.e2e.ts', feature: 'auth-start' }]);
    assert.deepEqual(resolveSpecs(dir, { selectors: ['sign-up/request-code'] }).map((s) => s.path), ['specs/golden/sign-up/request-code.e2e.ts']);
    assert.deepEqual(resolveSpecs(dir, { selectors: ['specs/explored/probe.e2e.ts'] }, dir), [{ kind: 'explored', path: 'specs/explored/probe.e2e.ts', feature: null }]);
    assert.deepEqual(resolveSpecs(dir, { all: true }).map((s) => s.path), ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/sign-up/request-code.e2e.ts']);
  });

  it('lists every feature for an unknown selector', () => {
    assert.throws(() => resolveSpecs(packageDir(), { selectors: ['profile'] }), { code: 'NO_SPECS', message: 'no specs match profile', fix: /name a feature \(auth-start, sign-up\)/ });
  });
});

describe('planE2E', () => {
  it('passes selection flags through and points output inside the run', () => {
    const plan = planE2E(SAMPLE_INPUTS, [{ kind: 'golden', path: 'specs/golden/a/b.e2e.ts', feature: null }], { verb: 'run', selection: { all: true }, grep: 'x', video: true, retries: 1, githubReport: false, waitSeconds: 0 }, '/package', e2eOutputDir('/package/.verify/runs/r20261002-141210-7c1e' as EvidencePath, 0));
    assert.deepEqual(plan.args, [
      'run', 'specs/golden/a/b.e2e.ts', '--config', 'e2e.config.ts', '--target', 'ios',
      '--output', '.verify/runs/r20261002-141210-7c1e/e2e', '--reporter', 'list,markdown,junit', '--retries', '1',
      '--grep', 'x', '--pass-with-no-tests',
    ]);
    assert.deepEqual(plan.env, {
      CLERK_E2E_PLATFORM: 'ios',
      CLERK_E2E_DEVICE: 'FDF0CD9E-CF9E-42B6-AE3A-116A665F7EF3',
      CLERK_E2E_DEVICE_SESSION: 'verify-ios-abc',
      CLERK_PUBLISHABLE_KEY: 'pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk',
      CLERK_E2E_API_URL: 'http://127.0.0.1:4010/v1',
      CLERK_E2E_API_TOKEN_FILE: '/package/.verify/scratch/r/broker-token',
      CLERK_E2E_RUN_ID: 'r20261002-141210-7c1e',
      AGENT_DEVICE_STATE_DIR: '/package/.verify/agent-device',
      E2E_TELEMETRY_DISABLED: '1',
    });
    const later = planE2E(SAMPLE_INPUTS, [], { verb: 'run', selection: { all: true }, video: true, retries: 0, githubReport: false, waitSeconds: 0 }, '/package', e2eOutputDir('/package/.verify/runs/r20261002-141210-7c1e' as EvidencePath, 2));
    assert.equal(later.args[later.args.indexOf('--output') + 1], '.verify/runs/r20261002-141210-7c1e/e2e-3', 'a later group of the run writes beside the first');
    assert.equal(later.args[later.args.indexOf('--retries') + 1], '0', 'e2e retries once by default when CI is set, so the run always says how many it wants');
    assert.equal(later.args.includes('--pass-with-no-tests'), true, 'every invocation is one group of a run, and a group with nothing left to run must not fail it');
  });
});

describe('parseE2EReport', () => {
  const report = {
    schemaVersion: 'report-1',
    run: {
      results: [
        {
          id: 'aaaaaaaa11', kind: 'test', titlePath: ['opens'], file: 'specs/golden/auth-start/opens.e2e.ts', platform: 'ios', tags: [], status: 'passed',
          attempts: [{ status: 'passed', durationMs: 9100, artifacts: [{ kind: 'screenshot', path: 'ios/x/attempt-0/screenshots/001-auth.png', producer: { kind: 'step', stepId: 's1' } }], steps: [{ id: 's1', api: 'app.screenshot', label: 'auth' }] }],
        },
        {
          id: 'bbbbbbbb22', kind: 'test', titlePath: ['completes'], file: 'specs/golden/sign-up/complete.e2e.ts', platform: 'ios', tags: [], status: 'skipped',
          skip: { cause: 'filtered', reason: 'title does not match --grep' }, attempts: [],
        },
        {
          id: 'ffffffff66', kind: 'test', titlePath: ['ios-only screen'], file: 'specs/golden/sign-up/request-code.e2e.ts', platform: 'android', tags: [], status: 'skipped',
          skip: { cause: 'platform-unavailable', reason: 'test declares platforms [ios]' }, attempts: [],
        },
        {
          id: 'dddddddd44', kind: 'test', titlePath: ['never ran'], file: 'specs/golden/auth-start/opens.e2e.ts', platform: 'ios', tags: [], status: 'skipped',
          skip: { cause: 'infrastructure-unavailable', reason: 'the device could not be opened' }, attempts: [],
        },
        {
          id: 'cccccccc33', kind: 'test', titlePath: ['fails'], file: 'specs/explored/probe.e2e.ts', platform: 'ios', status: 'timed-out',
          attempts: [{ status: 'timed-out', durationMs: 5000, error: { message: 'expect.toBeVisible failed\nobserved: no node' }, failure: { screen: 'art-1', screenshot: 'art-2' }, artifacts: [{ id: 'art-1', kind: 'other', path: 'ios/p/attempt-0/screen.txt' }, { id: 'art-2', kind: 'screenshot', path: 'ios/p/attempt-0/screenshots/001-failure.png' }] }],
        },
      ],
    },
  };

  it('keeps the failed attempt of a test that passed on a retry: its error, its failure page, and its screenshot', () => {
    const dir = e2eOutputDir(mkdtempSync(join(tmpdir(), 'verify-report-')) as EvidencePath, 0);
    mkdirSync(join(dir, 'failures'), { recursive: true });
    writeFileSync(join(dir, 'failures', 'specs_golden_auth-start_opens-opens-eeeeeeee.md'), '');
    mkdirSync(join(dir, 'artifacts', 'ios/o/attempt-0'), { recursive: true });
    writeFileSync(join(dir, 'artifacts', 'ios/o/attempt-0/screen.txt'), '');
    const attempt = (path: string) => ({ failure: { screen: 'screen', screenshot: 'shot' }, artifacts: [{ id: 'screen', kind: 'other', path: `${path}/screen.txt` }, { id: 'shot', kind: 'screenshot', path: `${path}/screenshots/001-failure.png` }] });
    const retried = (status: string, second: object) => ({
      schemaVersion: 'report-1',
      run: {
        results: [
          {
            id: 'eeeeeeee55', kind: 'test', titlePath: ['opens'], file: 'specs/golden/auth-start/opens.e2e.ts', platform: 'ios', tags: [], status,
            attempts: [{ status: 'failed', durationMs: 4000, error: { message: 'tap failed\nthe runner session ended' }, ...attempt('ios/o/attempt-0') }, { durationMs: 6000, ...second }],
          },
        ],
      },
    });

    const opens: readonly SpecRef[] = [{ kind: 'golden', path: 'specs/golden/auth-start/opens.e2e.ts', feature: null }];
    const [flaky] = parseE2EReport(retried('flaky', { status: 'passed' }), opens, dir);
    assert.equal(flaky!.status, 'flaky');
    assert.equal(flaky!.attempts, 2);
    assert.equal(flaky!.seconds, 10);
    assert.equal(flaky!.error, 'tap failed; the runner session ended');
    assert.equal(flaky!.failurePage, join(dir, 'failures', 'specs_golden_auth-start_opens-opens-eeeeeeee.md'));
    assert.equal(flaky!.failureScreen, join(dir, 'artifacts', 'ios/o/attempt-0/screen.txt'));
    assert.equal(flaky!.failureScreenshot, join(dir, 'artifacts', 'ios/o/attempt-0/screenshots/001-failure.png'));

    const [failed] = parseE2EReport(retried('failed', { status: 'failed', error: { message: 'tap failed again' }, ...attempt('ios/o/attempt-1') }), opens, dir);
    assert.equal(failed!.status, 'failed');
    assert.equal(failed!.attempts, 2);
    assert.equal(failed!.error, 'tap failed again', 'a test that fails every attempt shows its last one');
    assert.equal(failed!.failureScreenshot, join(dir, 'artifacts', 'ios/o/attempt-1/screenshots/001-failure.png'));
  });

  it('maps statuses, skip reasons, errors, and failure pages, in the directory its invocation wrote to', () => {
    const run = mkdtempSync(join(tmpdir(), 'verify-report-')) as EvidencePath;
    const dir = e2eOutputDir(run, 1);
    assert.equal(dir, join(run, 'e2e-2'));
    mkdirSync(join(dir, 'failures'), { recursive: true });
    writeFileSync(join(dir, 'failures', 'specs_explored_probe-fails-cccccccc.md'), '');
    mkdirSync(join(dir, 'artifacts', 'ios/p/attempt-0'), { recursive: true });
    writeFileSync(join(dir, 'artifacts', 'ios/p/attempt-0/screen.txt'), '');
    const results = parseE2EReport(report, ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/sign-up/complete.e2e.ts', 'specs/golden/sign-up/request-code.e2e.ts', 'specs/explored/probe.e2e.ts'].map((path) => ({ kind: 'golden', path, feature: null })), dir);
    assert.deepEqual(results.map((r) => r.status), ['passed', 'skipped', 'skipped', 'failed', 'failed']);
    assert.equal(results[3]!.error, 'not run: infrastructure-unavailable the device could not be opened');
    assert.equal(results[0]!.seconds, 9.1);
    assert.equal(results[0]!.spec.feature, null);
    assert.equal(results[1]!.skipReason, 'filtered: title does not match --grep');
    assert.equal(results[1]!.skippedBy, null);
    assert.equal(results[2]!.skipReason, 'skipped: ios only', 'a platform-scoped spec is skipped, not failed');
    assert.equal(results[2]!.skippedBy, 'platform');
    assert.equal(results[4]!.error, 'expect.toBeVisible failed; observed: no node');
    assert.equal(results[4]!.failureScreen, join(dir, 'artifacts', 'ios/p/attempt-0/screen.txt'));
    assert.equal(results[4]!.failureScreenshot, join(dir, 'artifacts', 'ios/p/attempt-0/screenshots/001-failure.png'), 'the full path, never truncated');
    const selected = parseE2EReport(report, [{ kind: 'golden', path: 'specs/golden/auth-start/opens.e2e.ts', feature: null }], dir);
    assert.deepEqual(selected.map((r) => r.spec.path), ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/auth-start/opens.e2e.ts'], 'files e2e lists but the run did not select are dropped');
    assert.equal(results[4]!.failurePage, join(dir, 'failures', 'specs_explored_probe-fails-cccccccc.md'));
  });

  it('refuses a report of another schema', () => {
    assert.throws(() => parseE2EReport({ schemaVersion: 'report-2', run: { results: [] } }, [], '/x' as EvidencePath), { code: 'E2E_CRASHED' });
  });

  it('copies app.screenshot artifacts under their labels, a later group replacing an earlier one with the same label', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-shots-')) as EvidencePath;
    for (const [index, bytes] of [[0, 'first'], [1, 'second']] as const) {
      mkdirSync(join(e2eOutputDir(dir, index), 'artifacts', 'ios/x/attempt-0/screenshots'), { recursive: true });
      writeFileSync(join(e2eOutputDir(dir, index), 'artifacts', 'ios/x/attempt-0/screenshots/001-auth.png'), bytes);
      assert.deepEqual(collectScreenshots(report, dir, e2eOutputDir(dir, index)), [{ label: 'auth', path: join(dir, 'screenshots', 'auth.png') }]);
      assert.equal(readFileSync(join(dir, 'screenshots', 'auth.png'), 'utf8'), bytes);
    }
  });
});

describe('MANIFEST', () => {
  it('matches the files, so doctor reports no drift', () => {
    assert.deepEqual(manifestDrift(), []);
  });
});

