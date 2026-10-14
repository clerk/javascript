import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

const PACKAGE = join(import.meta.dirname, '..');
const WORKTREE = join(import.meta.dirname, '..', '..', '..');
const workflow = readFileSync(join(import.meta.dirname, '..', '..', '..', '.github', 'workflows', 'ci.yml'), 'utf8');
const job = workflow.split(/\n(?= {2}[\w-]+:\n)/).find(block => block.startsWith('  expo-native-runner-tests:\n')) ?? '';
const steps = job.split(/\n(?= {6}- )/).slice(1);
const check = steps.find(step => step.includes('id: changed')) ?? '';

function list(name: string): readonly string[] {
  const folded = new RegExp(`^ {6}${name}: >-\\n((?: {8}\\S.*\\n)+)`, 'm').exec(job)?.[1] ?? '';
  return folded.split(/\s+/).filter(Boolean);
}

const WATCHED = list('WATCHED');
const MUST_EXIST = list('MUST_EXIST');
const covers = (entries: readonly string[], path: string) =>
  entries.some(entry => path === entry || path.startsWith(`${entry}/`));

const AUTHOR = ['-c', 'user.name=t', '-c', 'user.email=t@example.com'];
const BASE_FILES = [
  'integration/expo-native/src/cli.ts',
  '.github/workflows/verify-remote.yml',
  'packages/expo/app.plugin.js',
  'packages/clerk-js/src/core.ts',
];

type Change = { readonly edit?: string; readonly remove?: string };

function runCheck(event: string, change: Change): string {
  const repo = mkdtempSync(join(tmpdir(), 'verify-runner-job-'));
  const git = (...args: string[]) => execFileSync('git', [...AUTHOR, ...args], { cwd: repo, encoding: 'utf8' });
  try {
    git('init', '-q', '-b', 'main');
    for (const file of BASE_FILES) {
      mkdirSync(join(repo, dirname(file)), { recursive: true });
      writeFileSync(join(repo, file), 'base\n');
    }
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    git('switch', '-q', '-c', 'pr');
    if (change.edit) writeFileSync(join(repo, change.edit), 'changed\n');
    if (change.remove) git('rm', '-q', change.remove);
    git('commit', '-q', '-am', 'change');
    git('switch', '-q', 'main');
    git('merge', '-q', '--no-ff', '-m', 'merge', 'pr');
    const output = join(repo, 'github-output');
    writeFileSync(output, '');
    const script = /^ {8}run: \|\n((?: {10}.*\n?)+)/m.exec(check)?.[1] ?? '';
    execFileSync('bash', ['-e', '-c', script], {
      cwd: repo,
      env: {
        PATH: process.env.PATH,
        EVENT: event,
        WATCHED: WATCHED.join(' '),
        MUST_EXIST: MUST_EXIST.join(' '),
        GITHUB_OUTPUT: output,
      },
    });
    return readFileSync(output, 'utf8');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

async function pathsTestsRequireToExist(): Promise<readonly string[]> {
  const fixture = join(PACKAGE, 'src', 'fixture.ts');
  if (!existsSync(fixture)) return [];
  const { buildInputs } = await import(pathToFileURL(fixture).href);
  return ['ios', 'android'].flatMap(platform => buildInputs(platform, 'standalone') as readonly string[]);
}

describe('the Expo Native Runner Tests job', () => {
  it('skips its work on a pull request that changes nothing its tests read, and runs it otherwise', () => {
    const cases: readonly (readonly [string, Change])[] = [
      ['pull_request', { edit: 'packages/clerk-js/src/core.ts' }],
      ['pull_request', { edit: 'packages/expo/app.plugin.js' }],
      ['pull_request', { edit: 'integration/expo-native/src/cli.ts' }],
      ['pull_request', { edit: '.github/workflows/verify-remote.yml' }],
      ['pull_request', { remove: 'packages/expo/app.plugin.js' }],
      ['merge_group', { edit: 'packages/clerk-js/src/core.ts' }],
      ['push', { edit: 'packages/clerk-js/src/core.ts' }],
      ['schedule', { edit: 'packages/clerk-js/src/core.ts' }],
      ['workflow_dispatch', { edit: 'packages/clerk-js/src/core.ts' }],
    ];
    assert.deepEqual(
      cases.map(([event, change]) => runCheck(event, change)),
      ['', '', 'package=true\n', 'package=true\n', 'package=true\n', 'package=true\n', 'package=true\n', 'package=true\n', 'package=true\n'],
    );
  });

  it('skips by its steps and not as a whole job, so it still reports success to a pull request', () => {
    assert.doesNotMatch(job.slice(0, job.indexOf('\n    steps:')), /^ {4}if:/m);
    const gated = steps.slice(steps.indexOf(check) + 1);
    assert.ok(gated.length > 0, 'the job has steps after the check');
    assert.deepEqual(
      gated.filter(step => !/^ {8}if: steps\.changed\.outputs\.package == 'true'$/m.test(step)),
      [],
    );
  });

  it('watches every workflow and repository file its tests read, and every path they require to exist', async () => {
    const sources = readdirSync(import.meta.dirname)
      .filter(name => name.endsWith('.test.ts'))
      .map(name => readFileSync(join(import.meta.dirname, name), 'utf8'));
    const workflows = readdirSync(join(WORKTREE, '.github', 'workflows'))
      .filter(name => sources.some(source => source.includes(`'${name}'`)))
      .map(name => `.github/workflows/${name}`);
    const fromRoot = sources.flatMap(source =>
      [...source.matchAll(/join\((?:WORKTREE|import\.meta\.dirname, '\.\.', '\.\.', '\.\.')((?:, '[^']+')+)\)/g)].map(
        match => [...(match[1] ?? '').matchAll(/'([^']+)'/g)].map(segment => segment[1]).join('/'),
      ),
    );
    const read = [...new Set([...workflows, ...fromRoot.filter(path => path !== '.github/workflows')])];
    assert.ok(read.includes('.github/workflows/ci.yml'), 'this test reads ci.yml');
    assert.deepEqual(
      read.filter(path => !covers(WATCHED, path)),
      [],
    );
    assert.deepEqual(
      (await pathsTestsRequireToExist()).filter(path => !covers(WATCHED, path) && !covers(MUST_EXIST, path)),
      [],
    );
  });
});
