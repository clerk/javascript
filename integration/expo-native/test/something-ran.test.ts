import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { parseE2EReport } from '../src/core/e2e.ts';
import type { EvidencePath, RunId } from '../src/core/types.ts';
import { nextStep } from '../src/core/verbs.ts';

const run = 'r20261003-000000-abcd' as RunId;
const dir = mkdtempSync(join(tmpdir(), 'verify-ran-')) as EvidencePath;

function results(rows: readonly { tags?: string[]; status: string; skip?: { cause: string; reason: string } }[]) {
  const report = {
    schemaVersion: 'report-1',
    run: { results: rows.map((row, i) => ({ id: `0000000${i}aa`, kind: 'test', titlePath: [`t${i}`], file: 'specs/golden/auth-start/a.e2e.ts', platform: 'ios', tags: row.tags ?? [], status: row.status, skip: row.skip, attempts: [] })) },
  };
  return parseE2EReport(report, [{ kind: 'golden', path: 'specs/golden/auth-start/a.e2e.ts', feature: null }], dir);
}

describe('a run in which nothing executed', () => {
  it('fails when --grep matched no title', () => {
    const grepTypo = results([{ status: 'skipped', skip: { cause: 'filtered', reason: 'title does not match --grep' } }]);
    assert.throws(() => nextStep(run, dir, grepTypo, 'auth-start'), { code: 'NO_SPECS', message: /no test ran for auth-start: filtered: title does not match --grep/ });
  });

  it('fails when the selection registered no tests', () => {
    assert.throws(() => nextStep(run, dir, results([]), 'specs/explored/empty.e2e.ts'), { code: 'NO_SPECS', message: /registered no tests/ });
  });

  it('fails a file whose tests are all test.skip', () => {
    const allSkipped = results([{ status: 'skipped', skip: { cause: 'explicit', reason: 'test.skip' } }]);
    assert.equal(allSkipped[0]!.status, 'failed', 'an explicitly skipped test is reported as not run, which fails the run');
    assert.doesNotMatch(nextStep(run, dir, allSkipped, 'auth-start'), /attach/);
  });

  it('passes with no attach hint when every selected spec is for the other platform', () => {
    const next = nextStep(run, dir, results([{ status: 'skipped', skip: { cause: 'platform-unavailable', reason: 'test declares platforms [android]' } }]), 'sign-in-email-code');
    assert.match(next, /^nothing ran: every selected spec was left out/);
    assert.doesNotMatch(next, /attach/);
  });

  it('suggests attach after a run with a passing spec', () => {
    assert.match(nextStep(run, dir, results([{ status: 'passed' }]), 'auth-start'), /^\{cli\} attach r20261003-000000-abcd/);
  });
});
