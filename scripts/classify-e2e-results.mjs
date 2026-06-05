#!/usr/bin/env node

/**
 * Classifies the Playwright JSON reports produced by the staging E2E legs and emits a
 * structured digest, so a run reports "smoke green; generic: 2 candidate regressions,
 * 14 infra-flake, 5 flaky" instead of a bare red circle.
 *
 * Each failed test is bucketed by its error signature:
 *   - infra:     a known-noisy infrastructure signature (FAPI 429, handshake/JWT clock skew)
 *   - regression: anything else. UNKNOWN signatures default here, never to infra.
 * Flaky tests (failed then passed on retry) are reported separately and never gate.
 *
 * Usage:
 *   node scripts/classify-e2e-results.mjs <reportsDir> [--slack-payload <path>]
 *
 * `reportsDir` is a directory of downloaded `playwright-report-<run>-<attempt>-<leg>`
 * artifacts, each containing a Playwright `results.json`. The leg name is derived from the
 * artifact directory. Writes a markdown digest to $GITHUB_STEP_SUMMARY, a Slack blocks
 * payload to the --slack-payload path, and `severity` / `gating-failed` / `regression-count`
 * to $GITHUB_OUTPUT.
 */

import { appendFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

// Legs that are informational (continue-on-error) rather than gating. Failures here are
// surfaced in the digest but do not by themselves trigger an alert.
const INFORMATIONAL_LEGS = new Set(['generic']);

// Error-message signatures that mark a failure as known infrastructure noise rather than a
// product regression. Keep this conservative: an unknown failure must fall through to
// "regression", never get hidden as infra.
const INFRA_SIGNATURES = [
  { key: 'rate-limit', label: 'FAPI 429', test: /too many requests|status\s*429|\b429\b/i },
  {
    key: 'handshake',
    label: 'handshake/clock-skew',
    test: /not before date|\bnbf\b|jwt is expired|handshake (?:signature is invalid|token verification)|invalid signature/i,
  },
];

export function classifyError(message) {
  const text = message || '';
  for (const sig of INFRA_SIGNATURES) {
    if (sig.test.test(text)) return sig.key;
  }
  return null; // unknown -> treated as a candidate regression
}

function errorTextForTest(test) {
  const parts = [];
  for (const result of test.results || []) {
    if (result.error?.message) parts.push(result.error.message);
    for (const e of result.errors || []) {
      if (e.message) parts.push(e.message);
    }
  }
  return parts.join('\n');
}

/**
 * Walk a Playwright JSON report and return every spec's failure/flaky outcome.
 */
export function collectOutcomes(report) {
  const outcomes = [];

  const walk = suite => {
    for (const spec of suite.specs || []) {
      // A spec maps to one test title run across one or more projects/retries.
      for (const test of spec.tests || []) {
        const status = test.status; // 'expected' | 'unexpected' | 'flaky' | 'skipped'
        if (status === 'expected' || status === 'skipped') continue;
        outcomes.push({
          title: spec.title,
          file: spec.file,
          line: spec.line,
          project: test.projectName,
          status, // 'unexpected' | 'flaky'
          errorText: errorTextForTest(test),
        });
      }
    }
    for (const child of suite.suites || []) walk(child);
  };

  for (const suite of report.suites || []) walk(suite);
  return outcomes;
}

export function classifyLeg(leg, report) {
  const outcomes = collectOutcomes(report);
  const regressions = [];
  const infra = [];
  const flaky = [];

  for (const o of outcomes) {
    if (o.status === 'flaky') {
      flaky.push({ ...o, leg });
      continue;
    }
    // o.status === 'unexpected' (failed after all retries)
    const signature = classifyError(o.errorText);
    if (signature) {
      infra.push({ ...o, leg, signature });
    } else {
      regressions.push({ ...o, leg });
    }
  }

  return { leg, informational: INFORMATIONAL_LEGS.has(leg), regressions, infra, flaky };
}

// ── Report discovery ─────────────────────────────────────────────────────────

function findResultFiles(dir) {
  const found = [];
  const walk = current => {
    let entries;
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry);
      let stats;
      try {
        stats = statSync(full);
      } catch {
        continue;
      }
      if (stats.isDirectory()) {
        walk(full);
      } else if (entry === 'results.json') {
        found.push(full);
      }
    }
  };
  walk(dir);
  return found;
}

/**
 * Derive the leg name from a results.json path by finding the
 * `playwright-report-<run>-<attempt>-<leg>` artifact directory in its ancestry.
 */
export function legFromPath(filePath) {
  const segments = filePath.split('/');
  for (const segment of segments) {
    const match = segment.match(/^playwright-report-\d+-\d+-(.+)$/);
    if (match) return match[1];
  }
  // Fallback: the immediate parent directory name.
  const parent = segments[segments.length - 2];
  return parent || 'unknown';
}

// ── Aggregation + formatting ───────────────────────────────────────────────────

export function buildSummary(legResults) {
  const regressions = legResults.flatMap(l => l.regressions);
  const infra = legResults.flatMap(l => l.infra);
  const flaky = legResults.flatMap(l => l.flaky);

  // A gating failure is any failed test in a non-informational leg.
  const gatingFailures = legResults.filter(l => !l.informational).flatMap(l => [...l.regressions, ...l.infra]);
  const gatingFailed = gatingFailures.length > 0;
  const smokeFailed = legResults.some(l => l.leg === 'smoke' && (l.regressions.length > 0 || l.infra.length > 0));

  let severity = 'green';
  if (gatingFailed) severity = 'red';
  else if (regressions.length > 0 || infra.length > 0 || flaky.length > 0) severity = 'yellow';

  return { severity, gatingFailed, smokeFailed, regressions, infra, flaky };
}

const SEVERITY_EMOJI = { red: ':red_circle:', yellow: ':large_yellow_circle:', green: ':large_green_circle:' };

function legLine(l) {
  const bits = [];
  if (l.regressions.length)
    bits.push(`${l.regressions.length} candidate regression${l.regressions.length === 1 ? '' : 's'}`);
  if (l.infra.length) bits.push(`${l.infra.length} infra-flake`);
  if (l.flaky.length) bits.push(`${l.flaky.length} flaky`);
  const status = l.regressions.length || l.infra.length ? '❌' : l.flaky.length ? '⚠️' : '✅';
  const tag = l.informational ? ' _(informational)_' : '';
  return `${status} *${l.leg}*${tag}${bits.length ? `: ${bits.join(', ')}` : ''}`;
}

export function formatDigest(legResults, summary, runUrl, context) {
  const lines = [];
  const headline =
    summary.severity === 'red'
      ? 'Staging E2E: gating failure'
      : summary.severity === 'yellow'
        ? 'Staging E2E: passed with flake'
        : 'Staging E2E: all green';
  lines.push(`${SEVERITY_EMOJI[summary.severity]} *${headline}*`);
  if (context) lines.push(`_${context}_`);

  for (const l of [...legResults].sort(
    (a, b) => Number(a.informational) - Number(b.informational) || a.leg.localeCompare(b.leg),
  )) {
    lines.push(`• ${legLine(l)}`);
  }

  if (summary.regressions.length) {
    lines.push('', '*Candidate regressions* (unknown failures, investigate):');
    for (const r of summary.regressions.slice(0, 15)) {
      lines.push(`  • [${r.leg}] ${r.title} _(${basename(r.file || '')}:${r.line || '?'})_`);
    }
    if (summary.regressions.length > 15) lines.push(`  • …and ${summary.regressions.length - 15} more`);
  }

  if (runUrl) lines.push('', `<${runUrl}|View run>`);
  return lines.join('\n');
}

export function buildSlackPayload(digest) {
  return { blocks: [{ type: 'section', text: { type: 'mrkdwn', text: digest } }] };
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function main(reportsDir, { slackPayloadPath, runUrl, context, githubOutput, githubStepSummary } = {}) {
  const files = findResultFiles(reportsDir);
  const legResults = [];
  for (const file of files) {
    const leg = legFromPath(file);
    let report;
    try {
      report = JSON.parse(readFileSync(file, 'utf-8'));
    } catch (err) {
      console.error(`⚠️  Failed to parse ${file}: ${err.message}`);
      continue;
    }
    legResults.push(classifyLeg(leg, report));
  }

  if (legResults.length === 0) {
    console.log('No Playwright result files found; nothing to classify.');
  }

  const summary = buildSummary(legResults);
  const digest = formatDigest(legResults, summary, runUrl, context);
  console.log(digest);

  if (slackPayloadPath) {
    writeFileSync(slackPayloadPath, JSON.stringify(buildSlackPayload(digest), null, 2));
  }
  if (githubStepSummary) {
    appendFileSync(githubStepSummary, `${digest}\n`);
  }
  if (githubOutput) {
    appendFileSync(
      githubOutput,
      `severity=${summary.severity}\ngating-failed=${summary.gatingFailed}\nsmoke-failed=${summary.smokeFailed}\nregression-count=${summary.regressions.length}\n`,
    );
  }

  return { legResults, summary, digest };
}

const isDirectRun = process.argv[1] && basename(process.argv[1]) === 'classify-e2e-results.mjs';
if (isDirectRun) {
  const args = process.argv.slice(2);
  const reportsDir = args.find(a => !a.startsWith('--')) || 'reports';
  const slackFlagIndex = args.indexOf('--slack-payload');
  const slackPayloadPath = slackFlagIndex >= 0 ? args[slackFlagIndex + 1] : undefined;
  const context = [
    process.env.E2E_RUN_REF && `ref ${process.env.E2E_RUN_REF}`,
    process.env.E2E_SDK_SOURCE && `sdk ${process.env.E2E_SDK_SOURCE}`,
    process.env.E2E_CLERK_GO_SHA && `clerk_go ${process.env.E2E_CLERK_GO_SHA}`,
  ]
    .filter(Boolean)
    .join(' · ');
  try {
    main(reportsDir, {
      slackPayloadPath,
      runUrl: process.env.E2E_RUN_URL,
      context: context || undefined,
      githubOutput: process.env.GITHUB_OUTPUT,
      githubStepSummary: process.env.GITHUB_STEP_SUMMARY,
    });
  } catch (err) {
    // Reporting must never fail the build.
    console.error('Unexpected error while classifying results:', err);
  }
}
