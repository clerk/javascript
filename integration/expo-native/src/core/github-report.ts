import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { FinishedRun, Report } from 'e2e';
import { github } from '@e2e-dev/github';
import { protect, redact } from '../../specs/support/secret.ts';
import type { EvidenceRecord, VerifyFailure } from './types.ts';

const POST_TIMEOUT_MS = 60_000;

export function protectGitHubTokens(env: Readonly<Record<string, string | undefined>>): void {
  for (const name of ['GITHUB_TOKEN', 'GH_TOKEN']) {
    const value = env[name]?.trim();
    if (value) protect(value);
  }
}

type RunError = Report['run']['errors'][number];

export function mergeGroupReports(reports: readonly [Report, ...Report[]], notRun: readonly RunError[]): Report {
  const results = new Map<string, Report['run']['results'][number]>();
  for (const report of reports) {
    for (const result of report.run.results) {
      const seen = results.get(result.id);
      if (seen === undefined || (result.selected && !seen.selected)) results.set(result.id, result);
    }
  }
  const first = reports[0];
  const worst = reports.find((report) => report.run.status !== 'passed') ?? first;
  return {
    ...first,
    run: {
      ...first.run,
      status: notRun.length > 0 && worst.run.status === 'passed' ? 'failed' : worst.run.status,
      exitCode: notRun.length > 0 && worst.run.exitCode === 0 ? 1 : worst.run.exitCode,
      finishedAt: reports.at(-1)!.run.finishedAt,
      serialGroups: reports.flatMap((report) => report.run.serialGroups),
      results: [...results.values()],
      errors: [...reports.flatMap((report) => report.run.errors), ...notRun],
    },
  };
}

export interface GitHubReportInput {
  readonly record: EvidenceRecord;
  readonly failures: readonly { readonly label: string; readonly failure: VerifyFailure }[];
  readonly packageDir: string;
}

export async function reportToGitHub({ record, failures, packageDir }: GitHubReportInput): Promise<readonly string[]> {
  if (record.tainted.length > 0) return ['not reported: a file of this run holds a secret value'];
  try {
    const files = record.settings.flatMap((group) => (group.e2eReport !== null && existsSync(group.e2eReport) ? [group.e2eReport] : []));
    const [first, ...rest] = files.map((file) => JSON.parse(readFileSync(file, 'utf8')) as Report);
    if (first === undefined) return ['not reported: no group of this run wrote a report'];
    const report = mergeGroupReports(
      [first, ...rest],
      failures.map(({ label, failure }) => ({ category: 'infrastructure', code: failure.code, message: redact(`${label}: ${failure.message}`), retryable: false })),
    );
    const run: FinishedRun = {
      report,
      status: report.run.status,
      exitCode: report.run.exitCode,
      projectRoot: packageDir,
      reportPath: files[0],
      artifactsRoot: join(dirname(files[0]!), 'artifacts'),
      aiTracePath: undefined,
    };
    const rows = await github({ key: record.platform }).onRunFinished!(run, AbortSignal.timeout(POST_TIMEOUT_MS));
    return (rows ?? []).map((row) => row.text);
  } catch (error) {
    return [redact(`not reported: ${(error as Error).message ?? String(error)}`)];
  }
}
