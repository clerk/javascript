/**
 * One-time runtime disclosure that Clerk collects telemetry from development instances.
 *
 * Replaces the previous `postinstall` script. Disclosure is intentionally surfaced
 * only on Node (server-side) so the noise profile matches the original postinstall
 * (terminal-only, dev-eyes-only). Browser consoles are not used because they are
 * frequently observed by non-developers (QA, screenshots, demos), and adding another
 * console warning is a common source of customer complaints.
 *
 * Known gap: pure browser-only setups with no server-side Clerk runtime (e.g. a Vite
 * SPA using `@clerk/clerk-react` or `@clerk/clerk-js` directly, without any Node/Edge
 * backend that imports `@clerk/shared`) will never hit this code path and therefore
 * see no in-band disclosure. This is an accepted trade-off: the original postinstall
 * already fired only once at install time and was easily missed, so the practical
 * delta is small. Authoritative disclosure for those setups lives in the Clerk
 * telemetry docs (https://clerk.com/docs/telemetry). Opt-out continues to work the
 * same way (`telemetry={false}` on `<ClerkProvider>` or the framework-specific
 * `*_CLERK_TELEMETRY_DISABLED` env var).
 *
 * Persistence is in-process via a `globalThis` Symbol, which survives Next.js HMR
 * module reloads. No filesystem access, no `node:` imports, no dynamic-code APIs, so
 * the module remains safe to bundle for Edge Runtime, Workers, and any browser path.
 *
 * All work is wrapped in try/catch. Failure to display the notice must never affect
 * the SDK.
 */

import { isTruthy } from '../underscore';
import { automatedEnvironmentVariables } from '../utils/runtimeEnvironment';

const PROCESS_FLAG = Symbol.for('@clerk/shared.telemetryNoticeShown');

const NOTICE_LINES = [
  'Attention: Clerk collects telemetry data from its SDKs when connected to development instances.',
  "The data collected is used to inform Clerk's product roadmap.",
  'To learn more, including how to opt-out from the telemetry program, visit: https://clerk.com/docs/telemetry.',
];

function isServerRuntime(): boolean {
  // Skip in browsers.
  if (typeof window !== 'undefined') {
    return false;
  }
  // Skip in Next.js Edge Runtime, which exposes a global `EdgeRuntime` marker. We detect via
  // this marker (rather than checking `process.versions`) because the Edge Runtime build-time
  // analyzer flags any reachable read of `process.versions` even when it sits behind a guard.
  if (typeof (globalThis as { EdgeRuntime?: string }).EdgeRuntime !== 'undefined') {
    return false;
  }
  return true;
}

// Server-only notice: read process.env directly rather than going through
// getEnvVariable(), which would pull the multi-runtime env resolver into the
// clerk.browser.js bundle (it ships there via TelemetryCollector). We reuse the
// shared CI env-var list so the set of detected providers stays in one place.
function isCI(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }
  return automatedEnvironmentVariables.some(name => isTruthy(process.env[name]));
}

function hasSeen(): boolean {
  return Boolean((globalThis as Record<symbol, unknown>)[PROCESS_FLAG]);
}

function markSeen(): void {
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
 * Display the one-time telemetry disclosure on server runtimes if it has not already been
 * shown in this process. Browser and Edge Runtime callers are silently skipped. Never throws.
 */
export function maybeShowTelemetryNotice(options: MaybeShowTelemetryNoticeOptions = {}): void {
  if (options.skip) {
    return;
  }
  try {
    if (!isServerRuntime()) {
      return;
    }
    if (isCI()) {
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
