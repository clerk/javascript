import { ClerkRuntimeError } from '../../error';
import type { ProtectCheckResource } from '../../types';

export interface ExecuteProtectCheckOptions {
  /**
   * Host-provided visibility handshake, forwarded to the script verbatim as
   * `setWidgetVisible` in the init payload. The script calls it right before revealing UI in
   * the container (and with `false` once its widget is done); the returned promise resolves
   * only after the host has applied the change to the DOM (e.g. removed its own loading
   * spinner), so the script can sequence its reveal without a frame of overlap. A script that
   * knows its widget is imminent may call it immediately to avoid a spinner flash. Scripts
   * must treat the field as optional — older hosts don't provide it.
   */
  setWidgetVisible?: (visible: boolean) => Promise<void>;
  /**
   * Signals that the caller no longer needs the proof token (component unmounted, user
   * navigated away, etc.). When the signal aborts:
   *   - If the script has not yet been imported, `executeProtectCheck` rejects with
   *     `protect_check_aborted` without loading the script.
   *   - The signal is forwarded to the script as `{ signal }` in the second argument so
   *     cooperating SDKs can cancel any in-flight UI / network work.
   *   - Even if the script ignores the signal and resolves with a token, the helper
   *     re-checks `signal.aborted` after the await and rejects with `protect_check_aborted`
   *     so the caller never observes a "successful" abort.
   *
   * Scripts that don't honor the signal will continue to run; this is best-effort by design.
   */
  signal?: AbortSignal;
  /**
   * Overrides how long to wait for the challenge module to LOAD. Per-instance and per-loader
   * config, since the right value depends on the population an instance serves; a non-positive
   * or non-numeric value falls back to {@link DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS}.
   *
   * Bounds the handoff only — never the challenge. See the note on the constant.
   */
  loadTimeoutMs?: number;
}

/**
 * Default bound on LOADING the challenge module.
 *
 * Its only job is a network that accepts a connection and then never answers, because every
 * other load failure — a CSP block, DNS, a 404, a body that isn't a valid module — rejects the
 * dynamic import on its own and needs no timer to notice. That makes a generous value the safe
 * one: nothing legitimate is waiting on this timer, while a value tight enough to fire on a
 * genuinely slow connection would fail a load that was going to succeed.
 */
export const DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS = 60_000;

/**
 * Ceiling on the configured load bound. `setTimeout` stores its delay in a signed 32-bit int, so a
 * larger value overflows and fires immediately — which would make every load fail instantly, the
 * exact opposite of what an operator asking for a long timeout wanted. Clamping rather than
 * rejecting keeps a fat-fingered config from breaking sign-in.
 */
const MAX_PROTECT_CHECK_LOAD_TIMEOUT_MS = 600_000;

function resolveLoadTimeoutMs(configured: number | undefined): number {
  if (typeof configured !== 'number' || !Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_PROTECT_CHECK_LOAD_TIMEOUT_MS;
  }
  return Math.min(configured, MAX_PROTECT_CHECK_LOAD_TIMEOUT_MS);
}

/**
 * Races the dynamic import against `timeoutMs`, always clearing the timer so a fast load does not
 * leave one pending.
 *
 * The bound stops at the import on purpose. Once `mod.default` is called the challenge owns its
 * own deadline and the host imposes none: the host cannot know an honest duration for a challenge
 * whose type is chosen server-side, per decision, and whose work it deliberately knows nothing
 * about — waiting on a person, or moving a server-chosen number of bytes over an unknown link. A
 * host-side wall over execution aborts legitimate challenges and reports them as timeouts, and
 * since a re-run restarts the work, retrying cannot win on any connection slow enough to trip it.
 *
 * The abort signal is raced too. A stalled import cannot itself be cancelled, but without this the
 * caller's abort would not settle anything: an unmounted component would keep this promise, its
 * closures and its timer alive for the whole load bound, and then report a load failure for what
 * was really a cancellation.
 */
function importWithTimeout(
  url: string,
  timeoutMs: number,
  signal: AbortSignal | undefined,
): Promise<Record<string, unknown>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;

  const expiry = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Protect check script load timed out')), timeoutMs);
  });
  const aborted = new Promise<never>((_, reject) => {
    if (!signal) {
      return;
    }
    onAbort = () => reject(new Error('Protect check aborted during load'));
    signal.addEventListener('abort', onAbort, { once: true });
  });

  return Promise.race([import(/* webpackIgnore: true */ url), expiry, aborted]).finally(() => {
    clearTimeout(timeoutId);
    if (signal && onAbort) {
      signal.removeEventListener('abort', onAbort);
    }
  }) as Promise<Record<string, unknown>>;
}

interface ScriptInitOptions {
  token: string;
  uiHints?: Record<string, string>;
  signal?: AbortSignal;
  setWidgetVisible?: (visible: boolean) => Promise<void>;
}

type ScriptDefault = (container: HTMLDivElement, init: ScriptInitOptions) => Promise<string>;

/**
 * Validates the `sdk_url` returned by the server before passing it to dynamic `import()`.
 *
 * Rejects:
 *   - Anything that fails URL parsing (relative paths, garbage strings)
 *   - Non-`https:` schemes — including `http:`, `data:`, `blob:`, `javascript:`. The server
 *     always returns an HTTPS URL, but the dynamic-import primitive accepts `data:`/`blob:`
 *     modules which would let a tampered response inject arbitrary code into the host page.
 *   - URLs containing credentials (`user:pass@host`) — phishing surface, no legitimate use.
 *
 * Throws `ClerkRuntimeError` with code `protect_check_invalid_sdk_url`. We deliberately do
 * NOT silently strip an invalid `protect_check` from the resource: the gate must remain
 * present so the user can't bypass it by manipulating the response. Fail-closed.
 */
function assertValidSdkUrl(sdkUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(sdkUrl);
  } catch {
    throw new ClerkRuntimeError('Protect check sdk_url is not a valid URL', {
      code: 'protect_check_invalid_sdk_url',
    });
  }
  if (parsed.protocol !== 'https:') {
    throw new ClerkRuntimeError('Protect check sdk_url must use HTTPS', {
      code: 'protect_check_invalid_sdk_url',
    });
  }
  if (parsed.username || parsed.password) {
    throw new ClerkRuntimeError('Protect check sdk_url must not contain credentials', {
      code: 'protect_check_invalid_sdk_url',
    });
  }
  return parsed;
}

/**
 * Loads the Protect challenge SDK from `protectCheck.sdkUrl`, hands it the container element
 * and the spec-defined init payload (`token`, `uiHints`, `signal`), and returns the proof
 * token the SDK produces.
 *
 * The SDK script must:
 *   - Be a valid ES module served over HTTPS
 *   - Have a default export of the shape `(container, { token, uiHints, signal }) => Promise<string>`
 *   - Honor the `signal` to abort any pending work (best-effort)
 *
 * Only the minimal fields (`token`, optional `ui_hints`) are surfaced to the script — the
 * full sign-up/sign-in resource is intentionally NOT passed, to minimize the trust surface
 * granted to third-party Protect scripts.
 *
 * Failure modes are surfaced as `ClerkRuntimeError` with one of:
 *   - `protect_check_invalid_sdk_url` — URL fails the safety checks above
 *   - `protect_check_aborted` — caller aborted before or during execution
 *   - `protect_check_script_load_failed` — network error, CSP block, or invalid module
 *   - `protect_check_invalid_script` — module loaded but no callable default export
 *   - `protect_check_execution_failed` — the script's default export threw
 */
export async function executeProtectCheck(
  protectCheck: Pick<ProtectCheckResource, 'sdkUrl' | 'token' | 'uiHints'>,
  container: HTMLDivElement,
  options: ExecuteProtectCheckOptions = {},
): Promise<string> {
  const { signal, setWidgetVisible, loadTimeoutMs } = options;
  const { sdkUrl, token, uiHints } = protectCheck;

  const validated = assertValidSdkUrl(sdkUrl);

  if (signal?.aborted) {
    throw new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
  }

  let mod: Record<string, unknown>;
  try {
    mod = await importWithTimeout(validated.toString(), resolveLoadTimeoutMs(loadTimeoutMs), signal);
  } catch {
    // An abort that landed mid-load is a cancellation, not a load failure. Checked first so the
    // caller gets the same contract it does everywhere else: if you aborted, you never see
    // anything but `protect_check_aborted`.
    if (signal?.aborted) {
      throw new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
    }
    // Surface a generic message and deliberately omit the original error: Chromium/Firefox embed
    // the sdk_url in the dynamic-import failure text, which a tampered response could plant in the UI.
    throw new ClerkRuntimeError(
      'Protect check script failed to load. This is commonly caused by a Content Security ' +
        'Policy that blocks the script origin (add it to your script-src directive), a ' +
        'network error, or an invalid module.',
      { code: 'protect_check_script_load_failed' },
    );
  }

  if (signal?.aborted) {
    throw new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
  }

  if (typeof mod.default !== 'function') {
    throw new ClerkRuntimeError('Protect check script does not export a default function', {
      code: 'protect_check_invalid_script',
    });
  }

  let proofToken: string;
  try {
    proofToken = await (mod.default as ScriptDefault)(container, { token, uiHints, signal, setWidgetVisible });
  } catch (err) {
    // Distinguish abort-induced rejections from genuine script errors: only relabel as
    // `protect_check_aborted` when the error looks like an abort (`AbortError`), otherwise
    // surface the script's actual failure so production diagnostics aren't masked.
    const looksLikeAbort = err instanceof Error && err.name === 'AbortError';
    if (signal?.aborted && looksLikeAbort) {
      throw new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
    }
    const original = err instanceof Error ? err.message : String(err);
    throw new ClerkRuntimeError(`Protect check script execution failed: ${original}`, {
      code: 'protect_check_execution_failed',
    });
  }

  // The script may have ignored the signal and resolved with a token after the abort fired.
  // Re-check here so callers get a consistent contract: if you aborted, you never see a token.
  if (signal?.aborted) {
    throw new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
  }

  return proofToken;
}
