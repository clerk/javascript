import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const workflow = readFileSync(join(import.meta.dirname, '..', '..', '..', '.github', 'workflows', 'verify-e2e.yml'), 'utf8');
const triggers = workflow.slice(workflow.indexOf('\non:\n'), workflow.indexOf('\npermissions:'));
const plan = workflow.split(/\n(?= {2}[\w-]+:\n)/).find(job => job.startsWith('  plan:\n')) ?? '';

function runs(event: string, repository: string, headRef = ''): boolean {
  const condition = /^ {4}if: (.+)$/m.exec(plan)?.[1] ?? 'true';
  const script = condition
    .replaceAll('github.head_ref', JSON.stringify(headRef))
    .replaceAll('github.event_name', JSON.stringify(event))
    .replaceAll('github.repository', JSON.stringify(repository))
    .replaceAll(' != ', ' !== ')
    .replaceAll(' == ', ' === ');
  return new Function(`return ${script};`)() as boolean;
}

function decides(env: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'verify-e2e-plan-'));
  try {
    const output = join(dir, 'output');
    writeFileSync(output, '');
    const script = /^ {8}run: \|\n((?: {10}.*\n?|\n)+)/m.exec(plan)?.[1] ?? '';
    execFileSync('bash', ['-c', script], {
      env: { PATH: process.env.PATH, GITHUB_REPOSITORY: 'clerk/javascript', GITHUB_OUTPUT: output, ...env },
      stdio: 'ignore',
    });
    return readFileSync(output, 'utf8');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('when the end-to-end tests run', () => {
  it('run on a pull request to main that changes Expo code, every night at 07:00 UTC, and when a person starts them', () => {
    assert.equal(
      /^ {2}pull_request:\n(?: {4}.*\n)+/m.exec(triggers)?.[0],
      [
        '  pull_request:',
        '    types: [opened, synchronize, reopened, ready_for_review]',
        '    branches:',
        '      - main',
        '    paths:',
        "      - 'integration/expo-native/**'",
        "      - '!integration/expo-native/**/*.md'",
        "      - '.github/workflows/verify-e2e.yml'",
        "      - 'integration/templates/expo-native/**'",
        "      - 'packages/expo/**'",
        "      - 'packages/expo-biometrics/**'",
        "      - 'packages/expo-google-signin/**'",
        "      - 'packages/expo-native-components/**'",
        '',
      ].join('\n'),
    );
    assert.match(triggers, /^ {2}schedule:\n {4}- cron: ['"]0 7 \* \* \*['"]$/m);
    assert.match(triggers, /^ {2}workflow_dispatch:$/m);
  });

  it('run on the schedule only in clerk/javascript, and not for the changeset release pull request', () => {
    assert.ok(plan.length > 0, 'the workflow has a plan job');
    assert.deepEqual(
      [
        runs('schedule', 'clerk/javascript'),
        runs('schedule', 'someone/javascript'),
        runs('workflow_dispatch', 'clerk/javascript'),
        runs('workflow_dispatch', 'someone/javascript'),
        runs('pull_request', 'clerk/javascript', 'mike/change'),
        runs('pull_request', 'clerk/javascript', 'changeset-release/main'),
      ],
      [true, false, true, true, true, false],
    );
  });

  it('run for a pull request only once it is ready for review and comes from this repository', () => {
    const own = { HEAD_REPOSITORY: 'clerk/javascript', HAS_PLATFORM_API_KEY: 'true' };
    assert.deepEqual(
      [
        decides({ ...own, DRAFT: 'false' }),
        decides({ ...own, DRAFT: 'true' }),
        decides({ ...own, DRAFT: 'false', HEAD_REPOSITORY: 'someone/javascript' }),
        decides({ ...own, DRAFT: 'false', HAS_PLATFORM_API_KEY: 'false' }),
      ],
      ['run=true\n', 'run=false\n', 'run=false\n', 'run=false\n'],
    );
  });
});
