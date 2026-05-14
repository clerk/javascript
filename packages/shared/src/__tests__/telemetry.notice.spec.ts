import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { __resetTelemetryNoticeForTests, maybeShowTelemetryNotice } from '../telemetry/notice';

const STORAGE_KEY = 'clerk_telemetry_notice_v1';
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
    globalThis.localStorage.clear();
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

  test('prints the disclosure once and persists the marker', () => {
    maybeShowTelemetryNotice();

    expect(logSpy).toHaveBeenCalled();
    const printed = logSpy.mock.calls.map(call => String(call[0])).join('\n');
    expect(printed).toMatch(/Clerk collects telemetry/);
    expect(printed).toMatch(/clerk\.com\/docs\/telemetry/);
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  test('does not print again when the marker is already set', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, '1');

    maybeShowTelemetryNotice();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('skips entirely when skip:true is passed', () => {
    maybeShowTelemetryNotice({ skip: true });

    expect(logSpy).not.toHaveBeenCalled();
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('skips when a CI env var is set', () => {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.CI = 'true';

    maybeShowTelemetryNotice();

    expect(logSpy).not.toHaveBeenCalled();
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test.each(CI_VARS)('skips when %s is set', name => {
    process.env[name] = '1';

    maybeShowTelemetryNotice();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('skips when navigator.webdriver is true', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'webdriver');
    Object.defineProperty(window.navigator, 'webdriver', { configurable: true, value: true });

    try {
      maybeShowTelemetryNotice();
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window.navigator, 'webdriver', originalDescriptor);
      } else {
        Object.defineProperty(window.navigator, 'webdriver', { configurable: true, value: false });
      }
    }
  });

  test('does not print again when called multiple times in the same process', () => {
    maybeShowTelemetryNotice();
    maybeShowTelemetryNotice();
    maybeShowTelemetryNotice();

    const disclosureCalls = logSpy.mock.calls.filter(call => /Clerk collects telemetry/.test(String(call[0])));
    expect(disclosureCalls).toHaveLength(1);
  });

  test('does not throw if localStorage.setItem fails', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => maybeShowTelemetryNotice()).not.toThrow();
    setItemSpy.mockRestore();
  });
});
