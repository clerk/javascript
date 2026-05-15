/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { __resetTelemetryNoticeForTests, maybeShowTelemetryNotice } from '../telemetry/notice';

const CI_VARS = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'BUILD_NUMBER',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'CIRCLECI',
  'TRAVIS',
  'BUILDKITE',
  'JENKINS_URL',
  'TF_BUILD',
  'DRONE',
  'CODEBUILD_BUILD_ID',
];

function clearCIEnv() {
  for (const name of CI_VARS) {
    delete process.env[name];
  }
}

describe('maybeShowTelemetryNotice', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let originalCIEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalCIEnv = Object.fromEntries(CI_VARS.map(name => [name, process.env[name]]));
    clearCIEnv();
    __resetTelemetryNoticeForTests();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    for (const [name, value] of Object.entries(originalCIEnv)) {
      if (typeof value === 'string') {
        process.env[name] = value;
      } else {
        delete process.env[name];
      }
    }
  });

  test('prints the disclosure on Node', () => {
    maybeShowTelemetryNotice();

    expect(logSpy).toHaveBeenCalled();
    const printed = logSpy.mock.calls.map(call => String(call[0])).join('\n');
    expect(printed).toMatch(/Clerk collects telemetry/);
    expect(printed).toMatch(/clerk\.com\/docs\/telemetry/);
  });

  test('does not print again on subsequent calls in the same process', () => {
    maybeShowTelemetryNotice();
    maybeShowTelemetryNotice();
    maybeShowTelemetryNotice();

    const disclosureCalls = logSpy.mock.calls.filter(call => /Clerk collects telemetry/.test(String(call[0])));
    expect(disclosureCalls).toHaveLength(1);
  });

  test('skips entirely when skip:true is passed', () => {
    maybeShowTelemetryNotice({ skip: true });

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('skips when a CI env var is set', () => {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.CI = 'true';

    maybeShowTelemetryNotice();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test.each(CI_VARS)('skips when %s is set', name => {
    process.env[name] = '1';

    maybeShowTelemetryNotice();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('skips in a browser-like environment', () => {
    const original = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = {};

    try {
      maybeShowTelemetryNotice();
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      if (typeof original === 'undefined') {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window?: unknown }).window = original;
      }
    }
  });

  test('does not throw if console.log fails', () => {
    logSpy.mockImplementation(() => {
      throw new Error('console broken');
    });

    expect(() => maybeShowTelemetryNotice()).not.toThrow();
  });
});
