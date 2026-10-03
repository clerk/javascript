import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { collectScreenshots, excludedTags, parseE2EReport, planE2E, resolveSpecs } from '../src/core/e2e.ts';
import { manifestDrift } from '../src/core/manifest.ts';
import type { ActiveRunContext, EvidencePath, RunId } from '../src/core/types.ts';

function skill(): string {
  const dir = mkdtempSync(join(tmpdir(), 'verify-specs-'));
  for (const file of ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/sign-up/request-code.e2e.ts', 'specs/explored/probe.e2e.ts', 'specs/fixtures.ts']) {
    mkdirSync(join(dir, file, '..'), { recursive: true });
    writeFileSync(join(dir, file), '');
  }
  return dir;
}

describe('resolveSpecs', () => {
  it('expands features, feature/spec, paths, and --all', () => {
    const dir = skill();
    assert.deepEqual(resolveSpecs(dir, { selectors: ['auth-start'] }), [{ kind: 'golden', path: 'specs/golden/auth-start/opens.e2e.ts', feature: 'auth-start' }]);
    assert.deepEqual(resolveSpecs(dir, { selectors: ['sign-up/request-code'] }).map((s) => s.path), ['specs/golden/sign-up/request-code.e2e.ts']);
    assert.deepEqual(resolveSpecs(dir, { selectors: ['specs/explored/probe.e2e.ts'] }, dir), [{ kind: 'explored', path: 'specs/explored/probe.e2e.ts', feature: null }]);
    assert.deepEqual(resolveSpecs(dir, { all: true }).map((s) => s.path), ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/sign-up/request-code.e2e.ts']);
  });

  it('names the nearest feature for an unknown selector', () => {
    assert.throws(() => resolveSpecs(skill(), { selectors: ['auth-strat'] }), { code: 'NO_SPECS', fix: /auth-start/ });
  });
});

describe('planE2E', () => {
  it('passes selection flags through and points output inside the run', () => {
    const context: ActiveRunContext = {
      v: 1,
      run: 'r20261002-141210-7c1e' as RunId,
      workspace: '/skill/.verify',
      broker: { url: 'http://127.0.0.1:1', tokenFile: '/skill/.verify/scratch/r/broker-token' },
      agentDeviceSession: 'verify-ios-abc',
      targets: [],
      e2eVideo: false,
    };
    const plan = planE2E(context, [{ kind: 'golden', path: 'specs/golden/a/b.e2e.ts', feature: null }], { verb: 'run', selection: { all: true }, skip: ['form-entry'], include: [], grep: 'x', video: true, waitSeconds: 0 }, 'ios', '/skill');
    assert.deepEqual(plan.args, [
      'run', 'specs/golden/a/b.e2e.ts', '--config', 'e2e.config.ts', '--target', 'ios',
      '--output', '.verify/runs/r20261002-141210-7c1e/e2e', '--reporter', 'list,markdown',
      '--exclude-tag', 'form-entry,known-bug', '--grep', 'x', '--pass-with-no-tests',
    ]);
    assert.equal(plan.env.VERIFY_CONTEXT, '/skill/.verify/scratch/r20261002-141210-7c1e/context.json');
    assert.equal(plan.env.E2E_TELEMETRY_DISABLED, '1');
    const everything = planE2E(context, [], { verb: 'run', selection: { all: true }, skip: [], include: ['known-bug'], video: true, waitSeconds: 0 }, 'ios', '/skill');
    assert.equal(everything.args.includes('--pass-with-no-tests'), false, 'a run that excludes nothing still fails on an empty selection');
  });

  it('excludes known-bug specs by default and keeps them with --include known-bug', () => {
    assert.deepEqual(excludedTags({ skip: [], include: [] }), ['--exclude-tag', 'known-bug']);
    assert.deepEqual(excludedTags({ skip: ['form-entry'], include: [] }), ['--exclude-tag', 'form-entry,known-bug']);
    assert.deepEqual(excludedTags({ skip: [], include: ['known-bug'] }), []);
    assert.deepEqual(excludedTags({ skip: ['form-entry'], include: ['known-bug'] }), ['--exclude-tag', 'form-entry']);
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
          id: 'bbbbbbbb22', kind: 'test', titlePath: ['completes'], file: 'specs/golden/sign-up/complete.e2e.ts', platform: 'ios', tags: ['form-entry'], status: 'skipped',
          skip: { cause: 'filtered', reason: 'excluded by --exclude-tag form-entry' }, attempts: [],
        },
        {
          id: 'eeeeeeee55', kind: 'test', titlePath: ['email code sign-in drops the session'], file: 'specs/golden/sign-up/request-code.e2e.ts', platform: 'ios', tags: ['known-bug', 'form-entry'], status: 'skipped',
          skip: { cause: 'filtered', reason: 'carries an excluded tag' }, attempts: [],
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

  it('maps statuses, skip reasons, errors, and failure pages', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-report-')) as EvidencePath;
    mkdirSync(join(dir, 'e2e', 'failures'), { recursive: true });
    writeFileSync(join(dir, 'e2e', 'failures', 'specs_explored_probe-fails-cccccccc.md'), '');
    mkdirSync(join(dir, 'e2e', 'artifacts', 'ios/p/attempt-0'), { recursive: true });
    writeFileSync(join(dir, 'e2e', 'artifacts', 'ios/p/attempt-0/screen.txt'), '');
    const results = parseE2EReport(report, [], dir, ['form-entry', 'known-bug']);
    assert.deepEqual(results.map((r) => r.status), ['passed', 'skipped', 'skipped', 'skipped', 'failed', 'failed']);
    assert.equal(results[4]!.error, 'not run: infrastructure-unavailable the device could not be opened');
    assert.equal(results[0]!.seconds, 9.1);
    assert.equal(results[0]!.spec.feature, null);
    assert.equal(results[1]!.skipReason, 'skipped by --skip form-entry');
    assert.equal(results[2]!.skipReason, 'skipped: known-bug', 'known-bug wins over form-entry');
    assert.equal(results[2]!.title, 'email code sign-in drops the session');
    assert.equal(results[3]!.skipReason, 'skipped: ios only', 'a platform-scoped spec is skipped, not failed');
    const included = parseE2EReport(report, [], dir, ['form-entry']);
    assert.equal(included[2]!.skipReason, 'skipped by --skip form-entry', 'with --include known-bug, the reason is the tag that was excluded');
    assert.equal(results[5]!.error, 'expect.toBeVisible failed; observed: no node');
    assert.equal(results[5]!.failureScreen, join(dir, 'e2e', 'artifacts', 'ios/p/attempt-0/screen.txt'));
    assert.equal(results[5]!.failureScreenshot, join(dir, 'e2e', 'artifacts', 'ios/p/attempt-0/screenshots/001-failure.png'), 'the full path, never truncated');
    const selected = parseE2EReport(report, [{ kind: 'golden', path: 'specs/golden/auth-start/opens.e2e.ts', feature: null }], dir);
    assert.deepEqual(selected.map((r) => r.spec.path), ['specs/golden/auth-start/opens.e2e.ts', 'specs/golden/auth-start/opens.e2e.ts'], 'files e2e lists but the run did not select are dropped');
    assert.equal(results[5]!.failurePage, join(dir, 'e2e', 'failures', 'specs_explored_probe-fails-cccccccc.md'));
  });

  it('refuses a report of another schema', () => {
    assert.throws(() => parseE2EReport({ schemaVersion: 'report-2', run: { results: [] } }, [], '/x' as EvidencePath), { code: 'E2E_CRASHED' });
  });

  it('copies app.screenshot artifacts under their labels', () => {
    const dir = mkdtempSync(join(tmpdir(), 'verify-shots-')) as EvidencePath;
    mkdirSync(join(dir, 'e2e', 'artifacts', 'ios/x/attempt-0/screenshots'), { recursive: true });
    writeFileSync(join(dir, 'e2e', 'artifacts', 'ios/x/attempt-0/screenshots/001-auth.png'), 'png');
    assert.deepEqual(collectScreenshots(report, dir), [{ label: 'auth', path: join(dir, 'screenshots', 'auth.png') }]);
  });
});

describe('src/core MANIFEST', () => {
  it('matches the files, so doctor reports no drift', () => {
    assert.deepEqual(manifestDrift(), []);
  });
});

