import { REPOSITORY_LOCAL_GIT_ENV } from '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SCRUB_MODULE = join(TEST_DIR, '..', 'testing', 'git-env.ts');
const SCRUB_IMPORT = "'../testing/git-env.ts';";
const AUTHOR = ['-c', 'user.name=t', '-c', 'user.email=t@example.com'];

function repositoryWithOneCommit(): string {
  const dir = mkdtempSync(join(tmpdir(), 'verify-git-env-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', [...AUTHOR, 'commit', '-q', '--allow-empty', '-m', 'first'], { cwd: dir });
  return dir;
}

function stateOf(repository: string): { readonly head: string; readonly config: string } {
  return {
    head: execFileSync('git', ['--git-dir', join(repository, '.git'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    config: readFileSync(join(repository, '.git', 'config'), 'utf8'),
  };
}

describe('git environment of the unit tests', () => {
  it('names every variable git treats as local to one repository', () => {
    const fromGit = execFileSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' }).trim().split('\n');
    assert.deepEqual([...REPOSITORY_LOCAL_GIT_ENV].sort(), fromGit.sort());
  });

  it('is the first import of every test file, so no test runs git against an inherited repository', () => {
    const missing = readdirSync(TEST_DIR)
      .filter((name) => name.endsWith('.test.ts'))
      .filter((name) => !(readFileSync(join(TEST_DIR, name), 'utf8').split('\n')[0] ?? '').endsWith(SCRUB_IMPORT));
    assert.deepEqual(missing, []);
  });

  it('keeps a test that creates and commits to its own repository out of the one GIT_DIR names', () => {
    const outer = repositoryWithOneCommit();
    const own = mkdtempSync(join(tmpdir(), 'verify-git-env-own-'));
    try {
      const before = stateOf(outer);
      const script = [
        `await import(${JSON.stringify(SCRUB_MODULE)});`,
        `const { execFileSync } = await import('node:child_process');`,
        `execFileSync('git', ['init', '-q'], { cwd: ${JSON.stringify(own)} });`,
        `execFileSync('git', ${JSON.stringify([...AUTHOR, 'commit', '-q', '--allow-empty', '-m', 'inner'])}, { cwd: ${JSON.stringify(own)} });`,
      ].join('\n');
      execFileSync(process.execPath, ['--input-type=module', '-e', script], {
        env: { ...process.env, GIT_DIR: join(outer, '.git'), GIT_WORK_TREE: outer, GIT_INDEX_FILE: join(outer, '.git', 'index') },
      });
      assert.deepEqual(stateOf(outer), before);
      assert.equal(execFileSync('git', ['log', '--format=%s'], { cwd: own, encoding: 'utf8' }).trim(), 'inner');
    } finally {
      rmSync(outer, { recursive: true, force: true });
      rmSync(own, { recursive: true, force: true });
    }
  });
});
