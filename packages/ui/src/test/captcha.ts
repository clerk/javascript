/**
 * Test-only helpers for driving Cloudflare Turnstile captcha flows.
 *
 * Not bundled: this module lives under `src/test/` (the `@/test/*` alias resolves
 * only during test runs) and is never exported from the package entry.
 *
 * The interactive signal: our Turnstile logic (`turnstile.ts`) sets
 * `data-cl-interactive="true"` on `#clerk-captcha` when an interactive challenge
 * is showing and removes it on resolve/error. `CaptchaElement` observes this via a
 * MutationObserver. These helpers reproduce that transition so tests don't hand-roll
 * the DOM mutation inline.
 */

/** Simulate Turnstile escalating to an interactive challenge (widget expands). */
export const simulateCaptchaInteractive = (el: HTMLElement) => {
  el.dataset.clInteractive = 'true';
};

/** Simulate the interactive challenge resolving (widget collapses back). */
export const simulateCaptchaResolved = (el: HTMLElement) => {
  delete el.dataset.clInteractive;
};

/**
 * Cloudflare's documented dummy sitekeys for testing Turnstile.
 * @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 *
 * Force the interactive path locally by pointing the instance at
 * `FORCES_INTERACTIVE` and disabling the OAuth captcha bypass — LOCAL ONLY,
 * never commit these into instance config.
 */
export const TEST_SITEKEYS = {
  /** Always passes, visible widget. */
  ALWAYS_PASSES_VISIBLE: '1x00000000000000000000AA',
  /** Always fails, visible widget. */
  ALWAYS_FAILS_VISIBLE: '2x00000000000000000000AB',
  /** Always passes, invisible widget. */
  ALWAYS_PASSES_INVISIBLE: '1x00000000000000000000BB',
  /** Always fails, invisible widget. */
  ALWAYS_FAILS_INVISIBLE: '2x00000000000000000000BB',
  /** Forces an interactive challenge, visible widget. */
  FORCES_INTERACTIVE: '3x00000000000000000000FF',
} as const;

/**
 * Cloudflare's documented dummy secret keys (server-side verification).
 * @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export const TEST_SECRET_KEYS = {
  /** Always passes validation. */
  ALWAYS_PASSES: '1x0000000000000000000000000000000AA',
  /** Always fails validation. */
  ALWAYS_FAILS: '2x0000000000000000000000000000000AA',
  /** Returns a "token already spent" error. */
  TOKEN_ALREADY_SPENT: '3x0000000000000000000000000000000AA',
} as const;
