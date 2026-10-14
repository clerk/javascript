import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { artifact } from '../src/fixture.ts';

const WORKTREE = join(import.meta.dirname, '..', '..', '..');
const FETCH = join(import.meta.dirname, '..', 'bin', 'fetch-native-build.sh');
const workflow = (name: string) => readFileSync(join(WORKTREE, '.github', 'workflows', name), 'utf8');
const stepsOf = (text: string) => text.split(/\n(?= {6}- )/);

const scratch: string[] = [];
after(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});
const tempDir = (prefix: string) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  scratch.push(dir);
  return dir;
};

type Platform = 'ios' | 'android';
const APP: Readonly<Record<Platform, string>> = { ios: 'ClerkExpoNativeBuildFixture.app', android: 'app-release.apk' };

interface Artifact {
  readonly id: number;
  readonly name: string;
  readonly branch?: string;
  readonly fork?: boolean;
  readonly expired?: boolean;
  readonly created?: string;
}

interface Run {
  readonly id: number;
  readonly branch?: string;
  readonly fork?: boolean;
  readonly artifacts: readonly Artifact[];
}

function fetched(
  platform: Platform,
  env: Readonly<Record<string, string>>,
  store: { readonly artifacts?: readonly Artifact[]; readonly runs?: readonly Run[] },
) {
  const dir = tempDir('verify-expo-fetch-');
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  const ofRun = (entry: Artifact) => ({
    id: entry.id,
    name: entry.name,
    expired: entry.expired ?? false,
    created_at: entry.created ?? '2026-10-14T10:00:00Z',
    workflow_run: { head_branch: entry.branch ?? 'mike/change', repository_id: 1, head_repository_id: entry.fork ? 2 : 1 },
  });
  writeFileSync(join(dir, 'artifacts.json'), JSON.stringify({ artifacts: (store.artifacts ?? []).map(ofRun) }));
  writeFileSync(
    join(dir, 'runs.json'),
    JSON.stringify({
      workflow_runs: (store.runs ?? []).map(run => ({
        id: run.id,
        head_branch: run.branch ?? 'mike/change',
        repository: { id: 1 },
        head_repository: { id: run.fork ? 2 : 1 },
      })),
    }),
  );
  for (const run of store.runs ?? [])
    writeFileSync(join(dir, `run-${run.id}.json`), JSON.stringify({ artifacts: run.artifacts.map(ofRun) }));
  for (const entry of [...(store.artifacts ?? []), ...(store.runs ?? []).flatMap(run => run.artifacts)]) {
    const zipped = join(dir, `zipped-${entry.id}`);
    mkdirSync(zipped, { recursive: true });
    if (platform === 'ios') writeFileSync(join(zipped, 'main.jsbundle'), `bundle of ${entry.id}`);
    else writeFileSync(join(zipped, APP.android), `apk of ${entry.id}`);
    execFileSync('zip', ['-q', '-r', join(dir, `artifact-${entry.id}.zip`), '.'], { cwd: zipped });
  }
  writeFileSync(
    join(bin, 'gh'),
    `#!/bin/bash
url="$2"
echo "$url" >> "${join(dir, 'gh.log')}"
case "$url" in
  repos/clerk/javascript/actions/artifacts/*/zip) id="\${url%/zip}"; cat "${dir}/artifact-\${id##*/}.zip" ;;
  repos/clerk/javascript/actions/runs/*/artifacts*) id="\${url%/artifacts*}"; jq -r "$4" "${dir}/run-\${id##*/}.json" ;;
  repos/clerk/javascript/actions/workflows/verify-e2e.yml/runs*) jq -r "$4" "${join(dir, 'runs.json')}" ;;
  repos/clerk/javascript/actions/artifacts\\?*) jq -r "$4" "${join(dir, 'artifacts.json')}" ;;
  *) exit 1 ;;
esac
`,
    { mode: 0o755 },
  );
  const output = join(dir, 'output');
  writeFileSync(output, '');
  const ran = spawnSync('bash', [FETCH], {
    cwd: dir,
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      GITHUB_REPOSITORY: 'clerk/javascript',
      GITHUB_OUTPUT: output,
      RUNNER_TEMP: dir,
      BRANCH: 'mike/change',
      PLATFORM: platform,
      NATIVE_APP: APP[platform],
      ...env,
    },
    encoding: 'utf8',
    timeout: 20_000,
  });
  const read = (path: string) =>
    !existsSync(path)
      ? null
      : platform === 'ios'
        ? readFileSync(join(path, 'main.jsbundle'), 'utf8')
        : readFileSync(path, 'utf8');
  const cache = join(dir, 'cache');
  return {
    status: ran.status,
    stdout: ran.stdout,
    output: readFileSync(output, 'utf8'),
    kept: read(join(dir, 'native', 'kept', APP[platform])),
    cached: Object.fromEntries(
      (existsSync(cache) ? readdirSync(cache) : []).map(id => [id, read(join(cache, id, APP[platform]))]),
    ),
    gh: existsSync(join(dir, 'gh.log')) ? readFileSync(join(dir, 'gh.log'), 'utf8').trim().split('\n') : [],
  };
}

const exact = (platform: Platform) => ({ NATIVE_ID: `${platform}-0123456789abcdef`, NATIVE_DIR: 'native/kept' });

describe('the device suite takes the native build an earlier run kept for its fingerprint', () => {
  it('takes the newest artifact of that name from a run of the same branch of this repository', () => {
    const name = 'verify-expo-native-ios-0123456789abcdef';
    const result = fetched('ios', exact('ios'), {
      artifacts: [
        { id: 11, name, created: '2026-10-14T10:00:00Z' },
        { id: 12, name, created: '2026-10-14T11:00:00Z' },
        { id: 13, name, created: '2026-10-14T09:00:00Z' },
      ],
    });
    assert.equal(result.stdout, `Took the native build from artifact 12 (${name}).\n`);
    assert.equal(result.output, 'found=kept\n');
    assert.equal(result.kept, 'bundle of 12');
  });

  it('takes the APK out of the archive on Android', () => {
    const result = fetched('android', exact('android'), {
      artifacts: [{ id: 21, name: 'verify-expo-native-android-0123456789abcdef' }],
    });
    assert.equal(result.output, 'found=kept\n');
    assert.equal(result.kept, 'apk of 21');
  });

  it('builds when the only artifacts are of another branch, of a fork, or expired', () => {
    const name = 'verify-expo-native-ios-0123456789abcdef';
    const result = fetched('ios', exact('ios'), {
      artifacts: [
        { id: 31, name, branch: 'main' },
        { id: 32, name, fork: true },
        { id: 33, name, expired: true },
      ],
    });
    assert.equal(result.status, 0);
    assert.equal(result.output, 'found=none\n');
    assert.equal(result.kept, null);
    assert.equal(result.gh.length, 1);
    assert.equal(
      result.stdout,
      'No native build of this branch is kept for ios-0123456789abcdef, so this job builds it.\n',
    );
  });
});

describe('a session takes the native builds that runs of its branch kept, before it knows its fingerprint', () => {
  const cache = { NATIVE_CACHE: 'cache' };

  it('puts each kept build of its platform under its fingerprint, newest run first, and at most three', () => {
    const result = fetched('ios', cache, {
      runs: [
        {
          id: 5,
          artifacts: [
            { id: 51, name: 'verify-expo-native-ios-aaaa' },
            { id: 52, name: 'verify-expo-native-android-aaaa' },
            { id: 53, name: 'verify-e2e-ios' },
          ],
        },
        {
          id: 4,
          artifacts: [
            { id: 41, name: 'verify-expo-native-ios-aaaa' },
            { id: 42, name: 'verify-expo-native-ios-bbbb' },
          ],
        },
        {
          id: 3,
          artifacts: [
            { id: 31, name: 'verify-expo-native-ios-cccc' },
            { id: 32, name: 'verify-expo-native-ios-dddd', expired: true },
          ],
        },
        { id: 2, artifacts: [{ id: 21, name: 'verify-expo-native-ios-eeee' }] },
      ],
    });
    assert.equal(result.status, 0);
    assert.deepEqual(result.cached, {
      'ios-aaaa': 'bundle of 51',
      'ios-bbbb': 'bundle of 42',
      'ios-cccc': 'bundle of 31',
    });
    assert.equal(result.output, 'taken=3\n');
    assert.ok(!result.gh.some(url => url.includes('/runs/2/')), 'stops after three');
  });

  it('takes nothing from a run of another branch or of a fork', () => {
    const result = fetched('android', cache, {
      runs: [
        { id: 7, branch: 'main', artifacts: [{ id: 71, name: 'verify-expo-native-android-aaaa' }] },
        { id: 6, fork: true, artifacts: [{ id: 61, name: 'verify-expo-native-android-bbbb' }] },
      ],
    });
    assert.deepEqual(result.cached, {});
    assert.equal(result.output, 'taken=0\n');
    assert.deepEqual(result.gh, [
      'repos/clerk/javascript/actions/workflows/verify-e2e.yml/runs?branch=mike/change&per_page=20',
    ]);
  });

  it('starts with nothing when GitHub does not answer', () => {
    const result = fetched('ios', { ...cache, GITHUB_REPOSITORY: 'nowhere/at-all' }, { runs: [] });
    assert.equal(result.status, 0);
    assert.equal(result.output, 'taken=0\n');
  });
});

describe('the workflows and the native build store', () => {
  const session = workflow('verify-remote.yml');
  const steps = stepsOf(session);
  const at = (needle: string) => steps.findIndex(step => step.includes(needle));
  const fetch = steps[at('- name: Fetch the native builds that runs of this branch kept')] ?? '';

  it('runs the same script in the device suite and in a session', () => {
    const e2e = stepsOf(workflow('verify-e2e.yml')).find(step => step.includes('id: kept')) ?? '';
    assert.ok(e2e.includes('run: integration/expo-native/bin/fetch-native-build.sh'));
    assert.ok(e2e.includes('NATIVE_ID: ${{ steps.native.outputs.id }}'));
    assert.ok(fetch.includes('run: integration/expo-native/bin/fetch-native-build.sh'));
  });

  it('fetches before the session agent starts, into the cache the session build reads, under the app name the build looks for', () => {
    assert.ok(at('id: kept') > 0 && at('id: kept') < at('- name: Start the session agent and tunnel'));
    assert.ok(session.includes('\n      VERIFY_NATIVE_CACHE: integration/expo-native/.verify/native\n'));
    assert.ok(fetch.includes('NATIVE_CACHE: ${{ env.VERIFY_NATIVE_CACHE }}'));
    assert.ok(fetch.includes('BRANCH: ${{ github.ref_name }}'));
    const app = (platform: Platform) => basename(artifact(platform, 'standalone'));
    assert.ok(fetch.includes(`NATIVE_APP: \${{ env.PLATFORM == 'ios' && '${app('ios')}' || '${app('android')}' }}`));
    assert.match(
      session.slice(session.indexOf('\n  session:\n')),
      /^\n {2}session:\n(?: {4}.*\n)*? {4}permissions:\n {6}contents: read\n {6}actions: read\n/,
    );
  });
});
