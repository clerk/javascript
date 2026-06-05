import { describe, expect, it } from 'vitest';

import {
  buildSummary,
  classifyError,
  classifyLeg,
  collectOutcomes,
  formatDigest,
  legFromPath,
} from './classify-e2e-results.mjs';

// ── Helpers to build minimal Playwright JSON reports ──────────────────────────

function spec(title, status, errorMessage) {
  return {
    title,
    file: 'integration/tests/sign-in-flow.test.ts',
    line: 26,
    tags: [],
    ok: status === 'expected',
    tests: [
      {
        projectName: 'chrome',
        status,
        results: errorMessage ? [{ status: 'failed', error: { message: errorMessage }, errors: [] }] : [],
      },
    ],
  };
}

function report(specs) {
  return { suites: [{ title: 'sign-in-flow.test.ts', specs, suites: [] }], errors: [] };
}

// ── classifyError ─────────────────────────────────────────────────────────────

describe('classifyError', () => {
  it('flags FAPI 429 / too many requests as rate-limit infra', () => {
    expect(classifyError('FAPI request failed with status 429 after 4 attempts')).toBe('rate-limit');
    expect(classifyError('Error: Too Many Requests')).toBe('rate-limit');
  });

  it('flags handshake / JWT clock-skew as handshake infra', () => {
    expect(classifyError('JWT cannot be used prior to not before date claim (nbf).')).toBe('handshake');
    expect(classifyError('Clerk: unable to resolve handshake: Error: JWT is expired.')).toBe('handshake');
    expect(classifyError('Handshake signature is invalid.')).toBe('handshake');
  });

  it('returns null (candidate regression) for unknown errors', () => {
    expect(classifyError('expect(received).toBe(expected) // Object.is equality')).toBeNull();
    expect(classifyError('locator.click: Timeout 10000ms exceeded.')).toBeNull();
    expect(classifyError('')).toBeNull();
    expect(classifyError(undefined)).toBeNull();
  });
});

// ── collectOutcomes ─────────────────────────────────────────────────────────────

describe('collectOutcomes', () => {
  it('returns only failed and flaky specs, skipping expected/skipped', () => {
    const r = report([
      spec('passes', 'expected'),
      spec('fails', 'unexpected', 'boom'),
      spec('is flaky', 'flaky', 'transient'),
      spec('is skipped', 'skipped'),
    ]);
    const outcomes = collectOutcomes(r);
    expect(outcomes.map(o => o.title).sort()).toEqual(['fails', 'is flaky']);
    expect(outcomes.find(o => o.title === 'fails').errorText).toBe('boom');
  });

  it('walks nested suites', () => {
    const r = {
      suites: [
        {
          title: 'root',
          specs: [],
          suites: [{ title: 'child', specs: [spec('nested fail', 'unexpected', 'x')], suites: [] }],
        },
      ],
    };
    expect(collectOutcomes(r).map(o => o.title)).toEqual(['nested fail']);
  });
});

// ── classifyLeg ─────────────────────────────────────────────────────────────

describe('classifyLeg', () => {
  it('buckets failures into regression vs infra and separates flaky', () => {
    const r = report([
      spec('real bug', 'unexpected', 'expect(a).toBe(b)'),
      spec('rate limited', 'unexpected', 'status 429'),
      spec('handshake noise', 'unexpected', 'JWT is expired'),
      spec('retried ok', 'flaky', 'status 429'),
    ]);
    const result = classifyLeg('generic', r);
    expect(result.regressions.map(x => x.title)).toEqual(['real bug']);
    expect(result.infra.map(x => x.signature).sort()).toEqual(['handshake', 'rate-limit']);
    expect(result.flaky.map(x => x.title)).toEqual(['retried ok']);
    expect(result.informational).toBe(true); // generic is informational
  });

  it('marks non-generic legs as gating (not informational)', () => {
    expect(classifyLeg('smoke', report([])).informational).toBe(false);
    expect(classifyLeg('express', report([])).informational).toBe(false);
  });
});

// ── buildSummary ─────────────────────────────────────────────────────────────

describe('buildSummary', () => {
  it('is red when a gating leg fails (even on an infra failure)', () => {
    const legs = [classifyLeg('smoke', report([spec('x', 'unexpected', 'status 429')]))];
    const s = buildSummary(legs);
    expect(s.severity).toBe('red');
    expect(s.gatingFailed).toBe(true);
    expect(s.smokeFailed).toBe(true);
  });

  it('is NOT red when only the informational generic leg has failures', () => {
    const legs = [
      classifyLeg('smoke', report([spec('ok', 'expected')])),
      classifyLeg('generic', report([spec('real bug', 'unexpected', 'expect fail')])),
    ];
    const s = buildSummary(legs);
    expect(s.gatingFailed).toBe(false);
    // Regressions exist but only in the informational leg, so it is yellow, not a red alert.
    expect(s.severity).toBe('yellow');
    expect(s.regressions).toHaveLength(1);
  });

  it('is green when everything passes', () => {
    const legs = [classifyLeg('smoke', report([spec('ok', 'expected')]))];
    expect(buildSummary(legs).severity).toBe('green');
  });
});

// ── legFromPath ─────────────────────────────────────────────────────────────

describe('legFromPath', () => {
  it('derives the leg from the artifact directory name', () => {
    expect(legFromPath('reports/playwright-report-26980516926-1-generic/results.json')).toBe('generic');
    expect(legFromPath('reports/playwright-report-123-2-sessions-staging/playwright-report/results.json')).toBe(
      'sessions-staging',
    );
  });

  it('falls back to the parent directory name', () => {
    expect(legFromPath('reports/some-other-dir/results.json')).toBe('some-other-dir');
  });
});

// ── formatDigest ─────────────────────────────────────────────────────────────

describe('formatDigest', () => {
  it('lists per-leg breakdown and a regressions section with run link', () => {
    const legs = [
      classifyLeg('smoke', report([spec('ok', 'expected')])),
      classifyLeg('generic', report([spec('real bug', 'unexpected', 'expect fail'), spec('rl', 'unexpected', '429')])),
    ];
    const digest = formatDigest(legs, buildSummary(legs), 'https://example.com/run/1');
    expect(digest).toContain('*generic*');
    expect(digest).toContain('candidate regression');
    expect(digest).toContain('real bug');
    expect(digest).toContain('https://example.com/run/1');
  });
});
