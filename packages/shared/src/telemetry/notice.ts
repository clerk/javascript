/**
 * One-time runtime disclosure that Clerk collects telemetry from development instances.
 *
 * This module replaces the previous `postinstall` script that ran on every install of
 * `@clerk/shared`. Running disclosure at runtime (rather than via npm lifecycle scripts)
 * keeps published packages free of install-time code, which is a common supply-chain
 * concern, and only surfaces the notice in environments where telemetry actually fires.
 *
 * Persistence:
 *   - In browsers, `localStorage` keeps the notice from re-displaying across reloads.
 *   - In Node and other JS runtimes, a `globalThis` Symbol flag keeps it from
 *     re-displaying within the same process (this also survives Next.js HMR module
 *     reloads, since `globalThis` is shared). No filesystem access is performed so the
 *     module remains safe to bundle for Edge Runtime, Workers, and other restricted
 *     environments.
 *
 * All work is wrapped in try/catch. Failure to display or persist the notice must never
 * affect the SDK.
 */

import { isTruthy } from '../underscore';

const STORAGE_KEY = 'clerk_telemetry_notice_v1';
const PROCESS_FLAG = Symbol.for('@clerk/shared.telemetryNoticeShown');

const NOTICE_LINES = [
  'Attention: Clerk collects telemetry data from its SDKs when connected to development instances.',
  "The data collected is used to inform Clerk's product roadmap.",
  'To learn more, including how to opt-out from the telemetry program, visit: https://clerk.com/docs/telemetry.',
];

const CI_ENV_VARS = [
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

function isCI(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }
  return CI_ENV_VARS.some(name => isTruthy(process.env[name]));
}

function isHeadlessBrowser(): boolean {
  return typeof window !== 'undefined' && Boolean(window?.navigator?.webdriver);
}

function hasUsableLocalStorage(): boolean {
  try {
    return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function hasSeen(): boolean {
  if (hasUsableLocalStorage()) {
    try {
      return globalThis.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
  return Boolean((globalThis as Record<symbol, unknown>)[PROCESS_FLAG]);
}

function markSeen(): void {
  if (hasUsableLocalStorage()) {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, '1');
      return;
    } catch {
      // fall through to the in-process flag
    }
  }
  (globalThis as Record<symbol, unknown>)[PROCESS_FLAG] = true;
}

function printNotice(): void {
  if (typeof console === 'undefined' || typeof console.log !== 'function') {
    return;
  }
  for (const line of NOTICE_LINES) {
    console.log(line);
  }
  console.log('');
}

export type MaybeShowTelemetryNoticeOptions = {
  /**
   * Skip the notice entirely. Used when the caller has already determined that no
   * telemetry will be sent (e.g. opt-out, non-development instance), in which case
   * there is nothing to disclose.
   */
  skip?: boolean;
};

/**
 * Display the one-time telemetry disclosure if it has not already been shown. Safe to
 * call repeatedly: the browser-side marker prevents re-display across reloads, and the
 * `globalThis` flag prevents re-display within the same Node process. Never throws.
 */
export function maybeShowTelemetryNotice(options: MaybeShowTelemetryNoticeOptions = {}): void {
  if (options.skip) {
    return;
  }
  try {
    if (isCI() || isHeadlessBrowser()) {
      return;
    }
    if (hasSeen()) {
      return;
    }
    printNotice();
    markSeen();
  } catch {
    // never let disclosure break the SDK
  }
}

/**
 * Test-only: clear the in-process flag so the next call re-runs the gating logic.
 *
 * @internal
 */
export function __resetTelemetryNoticeForTests(): void {
  delete (globalThis as Record<symbol, unknown>)[PROCESS_FLAG];
}
