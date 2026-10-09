import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import type { Report } from 'e2e';
import { mergeGroupReports, protectGitHubTokens, reportToGitHub } from '../src/core/github-report.ts';
import { redact } from '../specs/support/secret.ts';
import { VerifyFailure, type EvidencePath, type EvidenceRecord } from '../src/core/types.ts';

interface Row {
  readonly file: string;
  readonly title: string;
  readonly status: 'passed' | 'flaky' | 'failed';
}

const ALL: readonly Row[] = [
  { file: 'specs/golden/auth-start/opens.e2e.ts', title: 'opens', status: 'passed' },
  { file: 'specs/golden/sign-up/complete.e2e.ts', title: 'completes', status: 'flaky' },
  { file: 'specs/golden/session-tasks/setup-mfa.e2e.ts', title: 'stops on the task', status: 'passed' },
];

function attempt(index: number, status: 'passed' | 'failed') {
  return {
    id: `attempt-${index}`,
    index,
    status,
    startedAt: '2026-10-06T13:58:54.750Z',
    durationMs: 5000,
    artifacts: [],
    secondaryErrors: [],
    cleanup: 'complete',
    steps: [],
    ...(status === 'failed' ? { error: { category: 'test', code: 'ASSERTION_FAILED', message: 'the runner session ended', retryable: false } } : {}),
  };
}

function groupReport(selected: readonly string[], startedAt: string, finishedAt: string): Report {
  const results = ALL.map((row, index) => {
    const ran = selected.includes(row.file);
    return {
      id: `${index}`.repeat(64),
      testId: `${row.file}::${row.title}`,
      kind: 'test',
      declarationIndex: 0,
      titlePath: [row.title],
      file: row.file,
      source: { file: row.file, line: 8, column: 1 },
      targetId: 'ios',
      platform: 'ios',
      agent: 'default',
      repeat: 0,
      tags: [],
      selected: ran,
      status: ran ? row.status : 'skipped',
      ...(ran ? {} : { skip: { cause: 'filtered', reason: 'file not selected by a positional argument' } }),
      attempts: !ran ? [] : row.status === 'flaky' ? [attempt(0, 'failed'), attempt(1, 'passed')] : [attempt(0, row.status)],
    };
  });
  return {
    schemaVersion: 'report-1',
    run: {
      id: `run-${startedAt}`,
      specVersion: '0.1',
      runner: { name: 'e2e', version: '0.18.0' },
      status: 'passed',
      exitCode: 0,
      startedAt,
      finishedAt,
      project: { id: 'verify-unit', configDigest: 'digest' },
      environment: { ci: true, trustNoticeShown: false, os: 'darwin', arch: 'arm64', runtime: 'node v24.15.0' },
      targets: [{ id: 'ios', index: 0, platform: 'ios', environment: 'test', engine: { name: 'mobile', version: '0.10.0', spiVersion: 1 }, capabilities: [], artifactCapabilities: [], stateCapability: false }],
      serialGroups: [],
      results,
      errors: [],
      summary: { discovered: 3, selected: selected.length, executed: selected.length, passed: selected.length, failed: 0, interrupted: 0, flaky: 0, skipped: 0 },
      limits: { maxAgentContextBytes: 0, maxLedgerBytes: 0, maxObservationBytes: 0, maxEventsPerStep: 0, maxModelTokensPerCall: 0 },
      usage: { discoveredResults: 3, maxAgentContextBytes: 0, maxLedgerBytes: 0, maxObservationBytes: 0, artifactBytes: 0, downloads: 0, events: 0, modelTokens: 0, maxModelCallsInStep: 0, maxActionStepsInStep: 0 },
    },
  } as unknown as Report;
}

const GROUPS = [
  groupReport([ALL[0]!.file], '2026-10-06T13:58:00.000Z', '2026-10-06T13:58:30.000Z'),
  groupReport([ALL[1]!.file], '2026-10-06T13:58:31.000Z', '2026-10-06T13:59:00.000Z'),
  groupReport([ALL[2]!.file], '2026-10-06T13:59:01.000Z', '2026-10-06T13:59:20.000Z'),
] as const;

describe('mergeGroupReports', () => {
  it('keeps the result of the group that ran each test, and spans the run from the first group to the last', () => {
    const merged = mergeGroupReports(GROUPS, []);
    assert.deepEqual(merged.run.results.map((result) => [result.selected, result.status]), [[true, 'passed'], [true, 'flaky'], [true, 'passed']]);
    assert.equal(merged.run.startedAt, '2026-10-06T13:58:00.000Z');
    assert.equal(merged.run.finishedAt, '2026-10-06T13:59:20.000Z');
    assert.equal(merged.run.status, 'passed');
  });

  it('is a failed run when a group did not run, though every report it has passed', () => {
    const merged = mergeGroupReports([GROUPS[0]], [{ category: 'infrastructure', code: 'E2E_CRASHED', message: 'MFA required: e2e exited 1', retryable: false }]);
    assert.equal(merged.run.status, 'failed');
    assert.equal(merged.run.exitCode, 1);
    assert.deepEqual(merged.run.errors.map((error) => error.message), ['MFA required: e2e exited 1']);
  });
});

describe('reportToGitHub', () => {
  const TOKEN = 'unit-test-github-token-value';
  const VARIABLES = ['GITHUB_ACTIONS', 'GITHUB_REPOSITORY', 'GITHUB_RUN_ID', 'GITHUB_EVENT_NAME', 'GITHUB_EVENT_PATH', 'GITHUB_WORKFLOW', 'GITHUB_JOB', 'GITHUB_SHA', 'GITHUB_REF', 'GITHUB_API_URL', 'GITHUB_STEP_SUMMARY', 'GITHUB_WORKSPACE', 'GITHUB_TOKEN', 'GH_TOKEN'];
  const saved = new Map<string, string | undefined>();
  const comments: { id: number; body: string }[] = [];
  let requests: string[] = [];
  let refuses = false;
  let server: Server;
  let scratch: string;

  before(async () => {
    server = createServer((request, response) => {
      let body = '';
      request.on('data', (chunk) => (body += chunk));
      request.on('end', () => {
        requests.push(`${request.method} ${request.url?.split('?')[0]} ${request.headers.authorization}`);
        const send = (value: unknown) => {
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(value));
        };
        if (refuses) {
          response.writeHead(403, { 'content-type': 'application/json' });
          return response.end('{"message":"Resource not accessible by integration"}');
        }
        if (request.method === 'GET') return send(comments);
        if (request.method === 'POST') {
          comments.push({ id: comments.length + 1, body: (JSON.parse(body) as { body: string }).body });
          return send({ ...comments.at(-1), html_url: `https://github.example/pull/7#issuecomment-${comments.length}` });
        }
        const id = Number(request.url?.split('/').at(-1));
        comments.find((comment) => comment.id === id)!.body = (JSON.parse(body) as { body: string }).body;
        return send({ id, html_url: `https://github.example/pull/7#issuecomment-${id}` });
      });
    });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  });
  after(() => server.close());

  beforeEach(() => {
    for (const name of VARIABLES) saved.set(name, process.env[name]);
    for (const name of VARIABLES) delete process.env[name];
    comments.length = 0;
    requests = [];
    refuses = false;
    scratch = mkdtempSync(join(tmpdir(), 'verify-github-'));
    writeFileSync(join(scratch, 'event.json'), JSON.stringify({ issue: { number: 7, pull_request: {} } }));
    writeFileSync(join(scratch, 'summary.md'), '');
  });
  afterEach(() => {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  const onActions = (event: string) =>
    Object.assign(process.env, {
      GITHUB_ACTIONS: 'true',
      GITHUB_REPOSITORY: 'clerk/unit',
      GITHUB_RUN_ID: '1',
      GITHUB_EVENT_NAME: event,
      GITHUB_EVENT_PATH: join(scratch, 'event.json'),
      GITHUB_WORKFLOW: 'PR CI',
      GITHUB_JOB: 'e2e-tests',
      GITHUB_API_URL: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
      GITHUB_STEP_SUMMARY: join(scratch, 'summary.md'),
      GITHUB_TOKEN: TOKEN,
    });

  const record = (tainted: readonly string[] = [], reports: readonly Report[] = GROUPS): EvidenceRecord =>
    ({
      platform: 'ios',
      gitHead: '0123456789abcdef0123456789abcdef01234567',
      tainted,
      settings: reports.map((report, index) => {
        const file = join(scratch, `e2e-${index}`, 'report.json') as EvidencePath;
        mkdirSync(join(scratch, `e2e-${index}`), { recursive: true });
        writeFileSync(file, JSON.stringify(report));
        return { label: `group ${index + 1}`, e2eReport: file };
      }),
    }) as unknown as EvidenceRecord;

  it('posts one comment for a run of three groups and updates that comment on the next run', async () => {
    onActions('issue_comment');
    const first = await reportToGitHub({ record: record(), failures: [], packageDir: scratch });
    assert.deepEqual(first, ['https://github.example/pull/7#issuecomment-1']);
    assert.deepEqual(requests, [`GET /repos/clerk/unit/issues/7/comments Bearer ${TOKEN}`, `POST /repos/clerk/unit/issues/7/comments Bearer ${TOKEN}`]);
    const body = comments[0]!.body;
    assert.equal(body.split('\n')[0], '<!-- e2e-github project=verify-unit workflow=PR%20CI job=e2e-tests key=ios -->');
    assert.match(body, /^### .* e2e ios: .*2 passed/m);
    assert.match(body, /1 flaky test passed on a retry/);
    assert.match(body, /the runner session ended/);
    for (const row of ALL) assert.ok(body.includes(row.title), row.title);
    assert.match(readFileSync(join(scratch, 'summary.md'), 'utf8'), /1 flaky test passed on a retry/);

    requests = [];
    await reportToGitHub({ record: record(), failures: [], packageDir: scratch });
    assert.deepEqual(requests.map((line) => line.split(' ').slice(0, 2).join(' ')), ['GET /repos/clerk/unit/issues/7/comments', 'PATCH /repos/clerk/unit/issues/comments/1']);
    assert.equal(comments.length, 1);
  });

  it('names a group that did not run in full, so a comment with fewer tests is not green', async () => {
    onActions('issue_comment');
    await reportToGitHub({ record: record([], [GROUPS[0]]), failures: [{ label: 'MFA required', failure: new VerifyFailure('E2E_CRASHED', 'e2e exited 1 before writing a report', 'read e2e.log') }], packageDir: scratch });
    assert.match(comments[0]!.body, /E2E_CRASHED.* MFA required: e2e exited 1 before writing a report/);
    assert.doesNotMatch(comments[0]!.body.split('\n')[1]!, /🟢/);
  });

  it('says why nothing was posted and does not throw when GitHub refuses the token', async () => {
    onActions('issue_comment');
    refuses = true;
    const lines = await reportToGitHub({ record: record(), failures: [], packageDir: scratch });
    assert.equal(lines.length, 1);
    assert.match(lines[0]!, /^not reported: the token cannot comment on clerk\/unit#7/);
    assert.equal(comments.length, 0);
  });

  it('writes the job summary and posts nothing when the event has no pull request', async () => {
    onActions('workflow_dispatch');
    writeFileSync(join(scratch, 'event.json'), '{}');
    process.env.GITHUB_REF = 'refs/heads/main';
    const lines = await reportToGitHub({ record: record(), failures: [], packageDir: scratch });
    assert.deepEqual(lines, ['not posted: workflow_dispatch is not a pull request; written to the job summary']);
    assert.deepEqual(requests, []);
    assert.match(readFileSync(join(scratch, 'summary.md'), 'utf8'), /e2e ios/);
  });

  it('reports nothing for a run that holds a secret value, and nothing outside GitHub Actions', async () => {
    onActions('issue_comment');
    assert.deepEqual(await reportToGitHub({ record: record(['e2e.log']), failures: [], packageDir: scratch }), ['not reported: a file of this run holds a secret value']);
    assert.equal(readFileSync(join(scratch, 'summary.md'), 'utf8'), '');
    delete process.env.GITHUB_ACTIONS;
    assert.deepEqual(await reportToGitHub({ record: record(), failures: [], packageDir: scratch }), ['not posted: not running on GitHub Actions']);
    assert.deepEqual(requests, []);
  });

  it('treats the GitHub token of the environment as a secret, so output is redacted and the evidence scan looks for it', () => {
    protectGitHubTokens({ GITHUB_TOKEN: TOKEN, GH_TOKEN: '' });
    assert.equal(redact(`authorization: Bearer ${TOKEN}`), 'authorization: Bearer <redacted>');
  });
});
