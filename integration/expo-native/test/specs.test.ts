import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { runPassword } from '@clerk/internal-mobile-e2e/specs/support/clerk';
import { SAMPLE_RUN } from '@clerk/internal-mobile-e2e/testing/sample-inputs';

const SPECS = join(import.meta.dirname, '..', 'specs');
const FEATURES = join(SPECS, 'features');

const featureSources = (): readonly (readonly [string, string])[] =>
  readdirSync(FEATURES, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.e2e.ts'))
    .map((file) => [file, readFileSync(join(FEATURES, file), 'utf8')] as const);

describe('the spec files', () => {
  it('all sit under specs/features/ or specs/explored/, because run --all skips a spec anywhere else and says nothing', () => {
    const stray = readdirSync(SPECS, { recursive: true, encoding: 'utf8' }).filter((path) => path.endsWith('.e2e.ts') && !/^(features|explored)\//.test(path));
    assert.deepEqual(stray, [], `run --all would skip specs/${stray.join(' and specs/')}: move it under specs/features/<feature>/ or specs/explored/`);
  });
});

describe('the screenshot labels of the committed specs', () => {
  it('are each used once, because a run keeps one screenshot for a label', () => {
    const takenIn = new Map<string, string[]>();
    for (const [file, source] of featureSources()) {
      const labels = [...source.matchAll(/\.screenshot\('([^']+)'\)/g)].map((match) => match[1]!);
      assert.equal(labels.length, source.split('.screenshot(').length - 1, `${file} takes a screenshot whose label is not a plain string`);
      for (const label of labels) takenIn.set(label, [...(takenIn.get(label) ?? []), file]);
    }
    assert.deepEqual([...takenIn].filter(([, files]) => files.length > 1), []);
  });
});

describe('the committed specs', () => {
  it('type the password of the run, and no text made from the run id', () => {
    const uses = featureSources().flatMap(([, source]) => [...source.matchAll(/[^\s(,]*\(?host\.runId\)?/g)].map((match) => match[0]));
    assert.deepEqual([...new Set(uses)], ['runPassword(host.runId)']);
    assert.equal(runPassword(SAMPLE_RUN).use('device-input', (plain) => plain), 'Cliff-Pond-6425');
  });
});
