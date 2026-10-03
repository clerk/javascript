import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { parseE2EReport } from '../src/core/e2e.ts';
import type { EvidencePath, OptInTag, RunId } from '../src/core/types.ts';
import { nextStep } from '../src/core/verbs.ts';

const run = 'r20261003-000000-abcd' as RunId;
const dir = mkdtempSync(join(tmpdir(), 'verify-ran-')) as EvidencePath;

function results(rows: readonly { tags?: string[]; status: string; skip?: { cause: string; reason: string } }[], excluded: readonly OptInTag[]) {
  const report = {
    schemaVersion: 'report-1',
    run: { results: rows.map((row, i) => ({ id: `0000000${i}aa`, kind: 'test', titlePath: [`t${i}`], file: 'specs/golden/auth-start/a.e2e.ts', platform: 'ios', tags: row.tags ?? [], status: row.status, skip: row.skip, attempts: [] })) },
  };
  return parseE2EReport(report, [], dir, excluded);
}

describe('a run in which nothing executed', () => {
  it('fails when --grep matched no title', () => {
    const grepTypo = results([{ status: 'skipped', skip: { cause: 'filtered', reason: 'title does not match --grep' } }], ['known-bug']);
    assert.throws(() => nextStep(run, dir, grepTypo, 'auth-start'), { code: 'NO_SPECS', message: /no test ran for auth-start: filtered: title does not match --grep/ });
  });

  it('fails when the selection registered no tests', () => {
    assert.throws(() => nextStep(run, dir, results([], ['known-bug']), 'specs/explored/empty.e2e.ts'), { code: 'NO_SPECS', message: /registered no tests/ });
  });

  it('fails a file whose tests are all test.skip', () => {
    const allSkipped = results([{ status: 'skipped', skip: { cause: 'explicit', reason: 'test.skip' } }], ['known-bug']);
    assert.equal(allSkipped[0]!.status, 'failed', 'an explicitly skipped test is reported as not run, which fails the run');
    assert.doesNotMatch(nextStep(run, dir, allSkipped, 'auth-start'), /attach/);
  });

  it('passes with no attach hint when --skip form-entry left every spec out', () => {
    const next = nextStep(run, dir, results([{ tags: ['form-entry'], status: 'skipped', skip: { cause: 'filtered', reason: 'carries an excluded tag' } }], ['form-entry', 'known-bug']), 'sign-up/complete');
    assert.match(next, /^nothing ran: every selected spec was left out/);
    assert.doesNotMatch(next, /attach/);
  });

  it('passes with no attach hint when the default known-bug exclusion left every spec out', () => {
    const next = nextStep(run, dir, results([{ tags: ['known-bug'], status: 'skipped', skip: { cause: 'filtered', reason: 'carries an excluded tag' } }], ['known-bug']), 'sign-in-email-code');
    assert.doesNotMatch(next, /attach/);
  });

  it('suggests attach after a run with a passing spec', () => {
    assert.match(nextStep(run, dir, results([{ status: 'passed' }], ['known-bug']), 'auth-start'), /^bin\/verify attach r20261003-000000-abcd/);
  });
});
