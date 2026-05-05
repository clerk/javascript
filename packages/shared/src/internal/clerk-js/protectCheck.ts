import { ClerkRuntimeError } from '../../error';
import type { ProtectCheckResource } from '../../types';

export interface ExecuteProtectCheckOptions {
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
}

interface ScriptInitOptions {
  token: string;
  uiHints?: Record<string, string>;
  signal?: AbortSignal;
}

type ScriptDefault = (container: HTMLDivElement, init: ScriptInitOptions) => Promise<string>;

/**
 * Validates the `sdk_url` returned by the server before passing it to dynamic `import()`.
 *
 * Rejects:
 *   - Anything that fails URL parsing (relative paths, garbage strings)
 *   - Non-`https:` schemes — including `http:`, `data:`, `blob:`, `javascript:`. The server
 *     contract (FAPI spec §2.1) says the URL is always HTTPS, but the dynamic-import
 *     primitive accepts `data:`/`blob:` modules which would let a tampered response inject
 *     arbitrary code into the host page.
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
 * Per FAPI spec §5.2, only the spec-defined fields (`token`, optional `ui_hints`) are
 * surfaced to the script — the full sign-up/sign-in resource is intentionally NOT passed
 * to minimize the trust surface granted to third-party Protect scripts.
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
  const { signal } = options;
  const { sdkUrl, token, uiHints } = protectCheck;

  const validated = assertValidSdkUrl(sdkUrl);

  if (signal?.aborted) {
    throw new ClerkRuntimeError('Protect check aborted by caller', { code: 'protect_check_aborted' });
  }

  let mod: Record<string, unknown>;
  try {
    mod = await import(/* webpackIgnore: true */ validated.toString());
  } catch (err) {
    // The browser surfaces CSP-blocked imports as the same error shape as a network error
    // (typically a TypeError "Failed to fetch dynamically imported module"), so we can't
    // reliably distinguish them. Surface a generic message to the UI — the URL is NOT
    // included to avoid a phishing surface where a tampered response could place an
    // attacker-chosen URL in the auth UI. Diagnostic detail goes to the original error.
    const original = err instanceof Error ? err.message : String(err);
    throw new ClerkRuntimeError(
      'Protect check script failed to load. This is commonly caused by a Content Security ' +
        'Policy that blocks the script origin (add it to your script-src directive), a ' +
        `network error, or an invalid module. (Original error: ${original})`,
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
    proofToken = await (mod.default as ScriptDefault)(container, { token, uiHints, signal });
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
