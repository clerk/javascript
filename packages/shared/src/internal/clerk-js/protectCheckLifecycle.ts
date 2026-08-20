import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import type { ProtectCheckResource } from '../../types';
import { ERROR_CODES } from './constants';
import type { ExecuteProtectCheckOptions } from './protectCheck';
import { executeProtectCheck } from './protectCheck';

/** Default upper bound on how long we wait for the challenge SDK to settle before failing loud. */
export const PROTECT_CHECK_SCRIPT_TIMEOUT_MS = 60_000;

/**
 * A plain GET reload does not re-mint a protect_check challenge server-side, so an expired
 * challenge would otherwise reload → still expired → reload again, forever. Callers that
 * reload on expiry must cap their attempts at this and surface an error instead of spinning
 * silently.
 *
 * NOTE: who re-mints an expired challenge on read (FAPI vs. re-running the gated step) is still
 * being decided with the clerk_go team; this cap is the defensive floor until that lands.
 */
export const MAX_EXPIRED_RELOADS = 2;

/** Whether the challenge expired client-side. `expiresAt` is unix milliseconds. */
export function isProtectCheckExpired(protectCheck: Pick<ProtectCheckResource, 'expiresAt'>): boolean {
  return protectCheck.expiresAt !== undefined && protectCheck.expiresAt < Date.now();
}

export interface ExecuteProtectCheckWithTimeoutOptions extends ExecuteProtectCheckOptions {
  /** Overrides the `PROTECT_CHECK_SCRIPT_TIMEOUT_MS` default. */
  timeoutMs?: number;
}

/**
 * `executeProtectCheck` wrapped with the lifecycle guarantees a host needs to run a challenge
 * safely:
 *
 *   - The container is cleared first: this run owns it outright, so a solved or errored widget
 *     from a previous run can't sit under (or stack with) the new one.
 *   - The whole run races a timeout (default {@link PROTECT_CHECK_SCRIPT_TIMEOUT_MS}); on
 *     timeout the (possibly hung) SDK is aborted and a retryable `protect_check_timed_out`
 *     `ClerkRuntimeError` is thrown.
 *   - The abort contract is best-effort, so a zombie script from a timed-out run can still call
 *     `setWidgetVisible` late — those signals are swallowed here and never reach the caller.
 *
 * The caller's `signal` is linked one-way into the run: aborting it aborts the SDK, but a
 * timeout does not abort the caller's controller.
 */
export async function executeProtectCheckWithTimeout(
  protectCheck: Pick<ProtectCheckResource, 'sdkUrl' | 'token' | 'uiHints'>,
  container: HTMLDivElement,
  options: ExecuteProtectCheckWithTimeoutOptions = {},
): Promise<string> {
  const { signal, setWidgetVisible, timeoutMs = PROTECT_CHECK_SCRIPT_TIMEOUT_MS } = options;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const controller = new AbortController();
  const onCallerAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  const guardedSetWidgetVisible = setWidgetVisible
    ? (visible: boolean): Promise<void> => {
        if (controller.signal.aborted) {
          return Promise.resolve();
        }
        return setWidgetVisible(visible);
      }
    : undefined;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      executeProtectCheck(protectCheck, container, {
        signal: controller.signal,
        setWidgetVisible: guardedSetWidgetVisible,
      }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(
            new ClerkRuntimeError('Protect verification timed out', {
              code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT,
            }),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

export type SubmitProtectCheckProofResult<TResource> =
  | { status: 'submitted'; resource: TResource }
  /** The server had already moved past this gate; `resource` is the live resource after a reload. */
  | { status: 'already_resolved'; resource: TResource }
  /** `isCancelled` reported true while recovering from a submit failure; nothing further ran. */
  | { status: 'cancelled' };

/**
 * Submits a proof token and absorbs the one submit failure that is actually a success:
 * `protect_check_already_resolved` means the server's state has already moved past this gate,
 * so the resource is reloaded to clear the stale local `protectCheck` and returned for the
 * caller to route on. Every other failure is rethrown untouched.
 */
export async function submitProtectCheckProof<TResource>(params: {
  proofToken: string;
  submitProtectCheck: (params: { proofToken: string }) => Promise<TResource>;
  /** Reloads the underlying resource (GET) to pick up fresh server state. */
  reload: () => Promise<unknown>;
  /** Returns the live resource, used to route after a reload (which mutates it in place). */
  getResource: () => TResource;
  /** Lets the caller bail out of the recovery path when its context has gone away. */
  isCancelled?: () => boolean;
}): Promise<SubmitProtectCheckProofResult<TResource>> {
  const { proofToken, submitProtectCheck, reload, getResource, isCancelled = () => false } = params;

  let resource: TResource;
  try {
    resource = await submitProtectCheck({ proofToken });
  } catch (err) {
    if (isCancelled()) {
      return { status: 'cancelled' };
    }
    if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === ERROR_CODES.PROTECT_CHECK_ALREADY_RESOLVED) {
      await reload();
      return { status: 'already_resolved', resource: getResource() };
    }
    throw err;
  }
  return { status: 'submitted', resource };
}
