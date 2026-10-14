import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';

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

interface Listed {
  readonly id: number;
  readonly branch: string;
  readonly fork?: boolean;
  readonly expired?: boolean;
  readonly created: string;
}

function fetched(platform: 'ios' | 'android', listed: readonly Listed[]) {
  const dir = tempDir('verify-expo-fetch-');
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  const zipped = join(dir, 'zipped');
  mkdirSync(zipped);
  const app = platform === 'ios' ? 'ClerkExpoNativeBuildFixture.app' : 'app-release.apk';
  if (platform === 'ios') writeFileSync(join(zipped, 'main.jsbundle'), 'kept bundle');
  else writeFileSync(join(zipped, app), 'kept apk');
  execFileSync('zip', ['-q', '-r', join(dir, 'artifact.zip'), '.'], { cwd: zipped });
  const artifacts = {
    artifacts: listed.map(entry => ({
      id: entry.id,
      expired: entry.expired ?? false,
      created_at: entry.created,
      workflow_run: { head_branch: entry.branch, repository_id: 1, head_repository_id: entry.fork ? 2 : 1 },
    })),
  };
  writeFileSync(join(dir, 'artifacts.json'), JSON.stringify(artifacts));
  writeFileSync(
    join(bin, 'gh'),
    `#!/bin/bash
echo "$*" >> "${join(dir, 'gh.log')}"
case "$2" in
  */zip) cat "${join(dir, 'artifact.zip')}" ;;
  *) jq -r "$4" "${join(dir, 'artifacts.json')}" ;;
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
      NATIVE_ID: `${platform}-0123456789abcdef`,
      NATIVE_DIR: 'native/kept',
      NATIVE_APP: app,
    },
    encoding: 'utf8',
    timeout: 20_000,
  });
  const kept = join(dir, 'native', 'kept', app);
  return {
    status: ran.status,
    stdout: ran.stdout,
    output: readFileSync(output, 'utf8'),
    kept: !existsSync(kept)
      ? null
      : platform === 'ios'
        ? readFileSync(join(kept, 'main.jsbundle'), 'utf8')
        : readFileSync(kept, 'utf8'),
    gh: readFileSync(join(dir, 'gh.log'), 'utf8').trim().split('\n'),
  };
}

describe('the step that fetches a native build an earlier run kept', () => {
  it('takes the newest artifact of the same branch of this repository and unpacks the app where the build looks', () => {
    const result = fetched('ios', [
      { id: 11, branch: 'mike/change', created: '2026-10-14T10:00:00Z' },
      { id: 12, branch: 'mike/change', created: '2026-10-14T11:00:00Z' },
      { id: 13, branch: 'mike/change', created: '2026-10-14T09:00:00Z' },
    ]);
    assert.deepEqual(result, {
      status: 0,
      stdout: 'Took the native build from artifact 12 (verify-expo-native-ios-0123456789abcdef).\n',
      output: 'found=kept\n',
      kept: 'kept bundle',
      gh: [
        `api repos/clerk/javascript/actions/artifacts?name=verify-expo-native-ios-0123456789abcdef&per_page=100 --jq ${'[.artifacts[] | select(.expired == false and .workflow_run.head_repository_id == .workflow_run.repository_id and .workflow_run.head_branch == $ENV.BRANCH)] | sort_by(.created_at) | last | .id // empty'}`,
        'api repos/clerk/javascript/actions/artifacts/12/zip',
      ],
    });
  });

  it('takes the APK out of the archive on Android', () => {
    const result = fetched('android', [{ id: 21, branch: 'mike/change', created: '2026-10-14T10:00:00Z' }]);
    assert.equal(result.output, 'found=kept\n');
    assert.equal(result.kept, 'kept apk');
  });

  it('builds when the only artifacts are of another branch, of a fork, or expired', () => {
    const result = fetched('ios', [
      { id: 31, branch: 'main', created: '2026-10-14T10:00:00Z' },
      { id: 32, branch: 'mike/change', fork: true, created: '2026-10-14T10:00:00Z' },
      { id: 33, branch: 'mike/change', expired: true, created: '2026-10-14T10:00:00Z' },
    ]);
    assert.equal(result.status, 0);
    assert.equal(result.output, 'found=none\n');
    assert.equal(result.kept, null);
    assert.equal(result.gh.length, 1);
    assert.equal(
      result.stdout,
      'No native build of this branch is kept for ios-0123456789abcdef, so this job builds it.\n',
    );
  });

  it('is the same step in the device suite and in a session', () => {
    for (const name of ['verify-e2e.yml', 'verify-remote.yml']) {
      const step = stepsOf(workflow(name)).find(text => text.includes('id: kept')) ?? '';
      assert.ok(step.includes('run: integration/expo-native/bin/fetch-native-build.sh'), name);
      for (const line of [
        'NATIVE_ID: ${{ steps.native.outputs.id }}',
        'NATIVE_DIR: ${{ steps.native.outputs.dir }}',
        'NATIVE_APP: ${{ steps.native.outputs.app }}',
      ])
        assert.ok(step.includes(line), `${name}: ${line}`);
    }
  });
});

describe('a session and the native build kept for its commit', () => {
  const session = workflow('verify-remote.yml');
  const steps = stepsOf(session);
  const at = (needle: string) => steps.findIndex(step => step.includes(needle));

  it('fetches it before the session agent starts, so the first build can use it', () => {
    assert.ok(at('id: native') > 0 && at('id: native') < at('id: kept'), 'named before fetched');
    assert.ok(at('id: kept') < at('- name: Start the session agent and tunnel'), 'fetched before the agent starts');
    assert.ok(at('pnpm install --frozen-lockfile') < at('id: native'), 'the fixture install needs the workspace');
    assert.ok(session.includes('\n      VERIFY_NATIVE_CACHE: integration/expo-native/.verify/native\n'));
    assert.ok(session.includes('BRANCH: ${{ github.ref_name }}'));
    assert.match(session.slice(session.indexOf('\n  session:\n')), /^\n  session:\n(?: {4}.*\n)*? {4}permissions:\n {6}contents: read\n {6}actions: read\n/);
  });
});
