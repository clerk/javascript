import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { executeProtectCheck } from '@clerk/shared/internal/clerk-js/protectCheck';
import type { ProtectCheckResource } from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

/**
 * A plain GET reload does not re-mint a protect_check challenge server-side, so an expired
 * challenge would otherwise reload → still expired → reload again, forever. Cap the attempts
 * and surface an error instead of spinning silently.
 *
 * NOTE: who re-mints an expired challenge on read (FAPI vs. re-running the gated step) is still
 * being decided with the clerk_go team; this cap is the defensive floor until that lands.
 */
const MAX_EXPIRED_RELOADS = 2;

/** Upper bound on how long we wait for the challenge SDK to settle before failing loud. */
const PROTECT_CHECK_SCRIPT_TIMEOUT_MS = 60_000;

export interface ProtectCheckRunnerParams<TResource> {
  /**
   * Reads the current protect_check off the resource. Called fresh on each effect run because
   * `fromJSON` mints a new object on every resource update — we key the effect on the token, not
   * this reference, so an unrelated refresh doesn't restart the challenge under the user.
   */
  getProtectCheck: () => ProtectCheckResource | null | undefined;
  /** Returns the live resource, used to route after a reload (which mutates it in place). */
  getResource: () => TResource;
  /** Reloads the underlying resource (GET) to pick up fresh server state. */
  reload: () => Promise<unknown>;
  /** Submits the proof token; resolves to the updated resource. */
  submitProtectCheck: (params: { proofToken: string }) => Promise<TResource>;
  /**
   * Continues the flow once the gate clears (or a chained challenge / already-resolved is
   * detected). Receives the resource to route on (the `submitProtectCheck` result, or the live
   * resource after a reload) and must finalize (`setActive`) the `complete` case itself.
   * `isCancelled` lets the continuation bail if the component unmounted mid-await.
   */
  onResolved: (resource: TResource, isCancelled: () => boolean) => Promise<unknown>;
}

export interface ProtectCheckRunner {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  isRunning: boolean;
  /** Whether the card is currently showing a (recoverable) error. */
  hasError: boolean;
  /** Clears the error and re-runs the challenge from scratch. */
  retry: () => void;
}

/**
 * Shared driver for the `<SignInProtectCheck />` and `<SignUpProtectCheck />` cards. Both run the
 * exact same lifecycle — load + execute the Protect SDK, submit the proof token, continue the flow
 * — so the abort/cancel/expiry/timeout/no-RHC handling lives here once instead of being duplicated
 * (and drifting) across the two components.
 *
 * Must be called from within a `CardStateProvider`.
 */
export function useProtectCheckRunner<TResource>(params: ProtectCheckRunnerParams<TResource>): ProtectCheckRunner {
  const card = useCardState();

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isRunningRef = React.useRef(false);
  const reloadCountRef = React.useRef(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [retryNonce, setRetryNonce] = React.useState(0);

  // Keep the latest callbacks without re-running the effect when the caller re-renders.
  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  const token = params.getProtectCheck()?.token;

  React.useEffect(() => {
    const { getProtectCheck, getResource, reload, submitProtectCheck, onResolved } = paramsRef.current;
    const protectCheck = getProtectCheck();
    if (!protectCheck || isRunningRef.current) {
      return;
    }

    const abortController = new AbortController();
    let cancelled = false;
    const isCancelled = () => cancelled;

    const cleanup = () => {
      cancelled = true;
      abortController.abort();
      // Reset the guard so the next mount / token change / retry can re-run; this is what makes
      // chained challenges work correctly across re-renders.
      isRunningRef.current = false;
    };

    const failWith = (code: string, message: string) => {
      isRunningRef.current = false;
      setIsRunning(false);
      handleError(new ClerkRuntimeError(message, { code }), [], card.setError);
    };

    // Fail closed in no-RHC builds (chrome extension / clerk.no-rhc.js): the gate requires a
    // remote `import(sdk_url)` we must not perform there. This guard MUST live in the component
    // layer — `executeProtectCheck` is in `@clerk/shared`, compiled once with the flag hard-coded
    // `false`, so a guard there would never trip.
    if (__BUILD_DISABLE_RHC__) {
      failWith(
        ERROR_CODES.PROTECT_CHECK_UNSUPPORTED_ENVIRONMENT,
        'Protect verification is not supported in this environment',
      );
      return;
    }

    // Expired challenge: reload once to pick up a fresh challenge if the server minted one, but
    // cap the attempts (see MAX_EXPIRED_RELOADS) so a server that returns the same expired
    // challenge on read can't spin us forever.
    if (protectCheck.expiresAt !== undefined && protectCheck.expiresAt < Date.now()) {
      if (reloadCountRef.current >= MAX_EXPIRED_RELOADS) {
        failWith(ERROR_CODES.PROTECT_CHECK_TIMED_OUT, 'Protect verification expired');
        return;
      }
      reloadCountRef.current += 1;
      isRunningRef.current = true;
      setIsRunning(true);
      void (async () => {
        try {
          await reload();
          if (cancelled) {
            return;
          }
          const refreshed = getProtectCheck();
          const stillExpired = !!refreshed && refreshed.expiresAt !== undefined && refreshed.expiresAt < Date.now();
          if (stillExpired) {
            // The server didn't re-mint on read. Don't sit on a spinner — fail loud so the user
            // gets a retry instead of an indefinite wait. (A fresh, different-token challenge
            // would have re-triggered this effect via the token dependency.)
            failWith(ERROR_CODES.PROTECT_CHECK_TIMED_OUT, 'Protect verification expired');
          }
        } catch (err: any) {
          if (!cancelled) {
            handleError(err, [], card.setError);
          }
        } finally {
          if (!cancelled) {
            isRunningRef.current = false;
            setIsRunning(false);
          }
        }
      })();
      return cleanup;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);

    const runChallenge = async () => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        const proofToken = await Promise.race([
          executeProtectCheck(protectCheck, container, { signal: abortController.signal }),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              // Stop the (possibly hung) SDK and surface a retryable timeout error.
              abortController.abort();
              reject(
                new ClerkRuntimeError('Protect verification timed out', {
                  code: ERROR_CODES.PROTECT_CHECK_TIMED_OUT,
                }),
              );
            }, PROTECT_CHECK_SCRIPT_TIMEOUT_MS);
          }),
        ]);
        if (cancelled) {
          return;
        }

        let updatedResource: TResource;
        try {
          updatedResource = await submitProtectCheck({ proofToken });
        } catch (err) {
          if (cancelled) {
            return;
          }
          // `protect_check_already_resolved` is retry-safe: the server's state has already moved
          // past this gate. Reload to clear the stale local protectCheck, then continue routing on
          // the refreshed live resource.
          if (isClerkAPIResponseError(err) && err.errors?.[0]?.code === ERROR_CODES.PROTECT_CHECK_ALREADY_RESOLVED) {
            await reload();
            if (cancelled) {
              return;
            }
            await onResolved(getResource(), isCancelled);
            return;
          }
          throw err;
        }
        if (cancelled) {
          return;
        }
        await onResolved(updatedResource, isCancelled);
      } catch (err: any) {
        if (cancelled) {
          return;
        }
        handleError(err, [], card.setError);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (!cancelled) {
          isRunningRef.current = false;
          setIsRunning(false);
        }
      }
    };

    void runChallenge();
    return cleanup;
    // Keyed on the challenge token (a primitive) rather than the protectCheck object: an unrelated
    // resource refresh keeps the same token and must NOT restart the challenge, while a genuine
    // chained challenge carries a new token and re-runs. `retryNonce` re-runs on manual retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, retryNonce]);

  const retry = React.useCallback(() => {
    card.setError('');
    reloadCountRef.current = 0;
    isRunningRef.current = false;
    setRetryNonce(n => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, isRunning, hasError: !!card.error, retry };
}
