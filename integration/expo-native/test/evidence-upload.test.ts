import '@clerk/internal-mobile-e2e/testing/git-env';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const workflow = readFileSync(join(import.meta.dirname, '..', '..', '..', '.github', 'workflows', 'verify-e2e.yml'), 'utf8');

function script(step: string): string {
  const lines = workflow.split('\n');
  const named = lines.findIndex((line) => line.trim() === `- name: ${step}`);
  assert.notEqual(named, -1, `no step ${step}`);
  const run = lines.findIndex((line, at) => at > named && line.trim() === 'run: |');
  const indent = lines[run]!.indexOf('run:');
  const body: string[] = [];
  for (const line of lines.slice(run + 1)) {
    if (line.trim() !== '' && line.search(/\S/) <= indent) break;
    body.push(line);
  }
  return body.join('\n');
}

function checked(runs: Readonly<Record<string, object | null>>, files: readonly string[] = []): { status: number | null; stdout: string; output: string } {
  const work = mkdtempSync(join(tmpdir(), 'verify-evidence-upload-'));
  const dir = join(work, '.verify', 'runs');
  mkdirSync(dir, { recursive: true });
  for (const [id, record] of Object.entries(runs)) {
    mkdirSync(join(dir, id));
    if (record !== null) writeFileSync(join(dir, id, 'run.json'), JSON.stringify(record));
  }
  for (const file of files) writeFileSync(join(dir, file), '');
  writeFileSync(join(work, 'output'), '');
  const ran = spawnSync('bash', ['-e', '-c', script('Check that every run is sealed')], {
    env: { PATH: process.env.PATH, PACKAGE: work, GITHUB_OUTPUT: join(work, 'output') },
    encoding: 'utf8',
    timeout: 20_000,
  });
  const output = readFileSync(join(work, 'output'), 'utf8');
  rmSync(work, { recursive: true, force: true });
  return { status: ran.status, stdout: ran.stdout, output };
}

const SEALED = { sealed: true, tainted: [] };

describe('the evidence of the end-to-end tests', () => {
  it('is uploaded when every run is sealed, beside the file that claims a run tag', () => {
    assert.deepEqual(checked({ 'r20261014-071700-951c': SEALED }, ['.tag-abcd']), { status: 0, stdout: '', output: 'upload=true\n' });
  });

  it('is not uploaded when a run was not sealed', () => {
    assert.deepEqual(checked({ 'r20261014-071700-951c': SEALED, 'r20261014-071800-abcd': null }), {
      status: 0,
      stdout: '::warning::Run r20261014-071800-abcd was not sealed, or a file in it holds a secret value. No evidence is uploaded.\n',
      output: 'upload=false\n',
    });
  });

  it('is not uploaded when there is no run', () => {
    assert.deepEqual(checked({}, ['.tag-abcd']), { status: 0, stdout: '', output: 'upload=false\n' });
  });
});
