import { accountlessInitGuidance, parsePublishableKey } from '@clerk/shared/keys';

const PROCESS_FLAG = Symbol.for('@clerk/nextjs.developmentKeyNoticeShown');

function hasSeen(): boolean {
  return Boolean((globalThis as Record<symbol, unknown>)[PROCESS_FLAG]);
}

function markSeen(): void {
  (globalThis as Record<symbol, unknown>)[PROCESS_FLAG] = true;
}

// Keeps a forged key from injecting escape sequences or extra lines into the terminal.
function isTerminalSafeInstance(value: string): boolean {
  return /^[a-z0-9.-]+$/i.test(value);
}

// PHASE_PRODUCTION_BUILD is hardcoded rather than imported from next/constants to keep that module out of client bundles.
function isBuildOrDevServer(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }
  return process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'development';
}

export type DevelopmentKeyNoticeOptions = {
  publishableKey?: string;
  /**
   * The resolved `unsafe_disableDevelopmentModeConsoleWarning` option (prop or env var).
   */
  disabled?: boolean;
  /**
   * Keys came from keyless mode, which prints its own guidance.
   */
  keyless?: boolean;
};

/**
 * Print a one-time terminal notice, per process, when `<ClerkProvider>` renders on the server with a
 * development publishable key. The notice names `npx clerk@latest init` so that a developer, or a
 * coding agent reading build output, learns that working keys need no Clerk account. Prints only
 * during `next build` and under `next dev`; browsers and deployed runtimes are skipped. Never throws.
 */
export function maybeShowDevelopmentKeyNotice(options: DevelopmentKeyNoticeOptions): void {
  try {
    if (typeof window !== 'undefined' || options.disabled === true || options.keyless === true || hasSeen()) {
      return;
    }
    if (!isBuildOrDevServer()) {
      return;
    }
    const parsed = parsePublishableKey(options.publishableKey);
    if (parsed?.instanceType !== 'development') {
      return;
    }
    if (typeof console === 'undefined' || typeof console.log !== 'function') {
      return;
    }
    const instance = isTerminalSafeInstance(parsed.frontendApi) ? ` (${parsed.frontendApi})` : '';
    // Unconditional for development keys: the SDK cannot tell a real instance from a fabricated key of the same shape without a network call, so no reachability check belongs here.
    console.log(`\n\x1b[35m[Clerk]:\x1b[0m Development keys in use${instance}. ${accountlessInitGuidance}\n`);
    markSeen();
  } catch {
    // never let the notice break rendering
  }
}

/**
 * Test-only: clear the in-process flag so the next call re-runs the gating logic.
 *
 * @internal
 */
export function __resetDevelopmentKeyNoticeForTests(): void {
  delete (globalThis as Record<symbol, unknown>)[PROCESS_FLAG];
}
