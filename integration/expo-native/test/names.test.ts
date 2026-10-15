import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { promisify } from 'node:util';
import { ORGANIZATIONS, PASSWORD_WORDS, PEOPLE, runNames } from '../specs/support/names.ts';
import type { RunId } from '../specs/support/types.ts';
import { SAMPLE_RUN } from '../testing/sample-inputs.ts';

const OTHER_RUN = 'r20261015-103822-7a42' as RunId;
const NAMES_MODULE = join(import.meta.dirname, '..', 'specs', 'support', 'names.ts');

const freshDir = (): string => mkdtempSync(join(tmpdir(), 'verify-names-'));

const claimInAnotherProcess = async (run: RunId, dir: string, count: number): Promise<string[]> => {
  const script = `const { runNames } = await import(${JSON.stringify(NAMES_MODULE)}); const names = runNames(${JSON.stringify(run)}, ${JSON.stringify(dir)}); console.log(JSON.stringify(Array.from({ length: ${count} }, () => names.claim('person'))));`;
  const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', script]);
  return JSON.parse(stdout) as string[];
};

describe('the names a run types', () => {
  it('start on the same word for the same run, on a fresh machine', () => {
    assert.deepEqual([runNames(SAMPLE_RUN, freshDir()).claim('person'), runNames(SAMPLE_RUN, freshDir()).claim('person')], ['rosa', 'rosa']);
    assert.deepEqual([runNames(SAMPLE_RUN, freshDir()).claim('organization'), runNames(SAMPLE_RUN, freshDir()).claim('organization')], ['Forge', 'Forge']);
  });

  it('are never handed out twice in one run, by several processes claiming at once', async () => {
    const dir = freshDir();
    const claims = await Promise.all(Array.from({ length: 3 }, () => claimInAnotherProcess(SAMPLE_RUN, dir, 100)));
    const all = claims.flat();
    assert.equal(all.length, 300);
    assert.equal(new Set(all).size, 300, `a name was handed out twice: ${all.join(' ')}`);
    assert.equal(runNames(SAMPLE_RUN, dir).claim('person'), 'lane8', 'this process goes on after the 300 names the others took');
  });

  it('go through the table, then take the words again with a number', () => {
    const names = runNames(SAMPLE_RUN, freshDir());
    const claimed = Array.from({ length: PEOPLE.length + 2 }, () => names.claim('person'));
    assert.deepEqual(claimed.slice(0, PEOPLE.length).toSorted(), [...PEOPLE].toSorted());
    assert.deepEqual(claimed.slice(0, 3), ['rosa', 'sam', 'tara']);
    assert.deepEqual(claimed.slice(PEOPLE.length), ['rosa2', 'sam2']);
  });

  it('keep people and organizations apart, so claiming one does not use up the other', () => {
    const names = runNames(SAMPLE_RUN, freshDir());
    assert.deepEqual([names.claim('person'), names.claim('organization'), names.claim('person'), names.claim('organization')], ['rosa', 'Forge', 'sam', 'Granite']);
  });

  it('of another run are claimed apart from this run, in a directory of its own', () => {
    const before = process.env.TMPDIR;
    process.env.TMPDIR = freshDir();
    try {
      const mine = runNames(SAMPLE_RUN);
      assert.deepEqual([mine.claim('person'), mine.claim('person'), runNames(SAMPLE_RUN).claim('person')], ['rosa', 'sam', 'tara'], 'a second process of the run sees the claims of the first');
      assert.equal(runNames(OTHER_RUN).claim('person'), 'cole', 'another run starts on its own first word, as on a fresh machine');
      assert.deepEqual(readdirSync(join(process.env.TMPDIR, 'clerk-e2e-names')).toSorted(), [OTHER_RUN, SAMPLE_RUN].toSorted());
    } finally {
      if (before === undefined) delete process.env.TMPDIR;
      else process.env.TMPDIR = before;
    }
  });

  it('start on different words for different runs, most of the time', () => {
    const runs = Array.from({ length: 40 }, (_, n) => `r20261015-1038${String(n).padStart(2, '0')}-7a42` as RunId);
    const firstWords = new Set(runs.map((run) => runNames(run, freshDir()).claim('person')));
    assert.ok(firstWords.size >= 15, `40 runs start on only ${firstWords.size} words`);
  });

  it('come from tables of short words where no word starts another, and no word is in two tables', () => {
    const shapes = [
      [PEOPLE, /^[a-z]{3,5}$/],
      [ORGANIZATIONS, /^[A-Z][a-z]{3,6}$/],
      [PASSWORD_WORDS, /^[A-Z][a-z]{2,4}$/],
    ] as const;
    for (const [table, shape] of shapes) {
      assert.deepEqual(table.filter((word) => !shape.test(word)), []);
      assert.deepEqual(table.filter((word) => table.some((other) => other !== word && other.startsWith(word))), []);
    }
    const lower = shapes.flatMap(([table]) => table.map((word) => word.toLowerCase()));
    assert.equal(new Set(lower).size, lower.length);
    assert.deepEqual([PEOPLE.length, ORGANIZATIONS.length, PASSWORD_WORDS.length], [40, 24, 32]);
  });
});
