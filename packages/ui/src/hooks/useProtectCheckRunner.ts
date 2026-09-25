import { ClerkRuntimeError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import type {
  ProtectCheckRunner as ProtectCheckRunnerCore,
  ProtectCheckRunnerResource,
} from '@clerk/shared/internal/clerk-js/protectCheckRunner';
import { useClerk } from '@clerk/shared/react';
import React from 'react';
import { flushSync } from 'react-dom';

import { useEnvironment } from '@/ui/contexts/EnvironmentContext';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

export interface ProtectCheckRunnerParams<TResource> extends ProtectCheckRunnerResource<TResource> {
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
  /**
   * Whether the challenge script has signalled (via the `setWidgetVisible` init callback) that
   * it is showing a widget in the container. While true, the widget owns the progress UI —
   * callers should hide their own spinner and give the container layout space.
   */
  isWidgetVisible: boolean;
  /** Whether the card is currently showing a (recoverable) error. */
  hasError: boolean;
  /** Clears the error and re-runs the challenge from scratch. */
  retry: () => void;
}

/**
 * Shared driver for the `<SignInProtectCheck />` and `<SignUpProtectCheck />` cards. The challenge
 * lifecycle itself lives in `ProtectCheckRunner` from `@clerk/shared`. This hook binds it to the
 * card's spinner, error, and continuation.
 *
 * Must be called from within a `CardStateProvider`.
 */
export function useProtectCheckRunner<TResource>(params: ProtectCheckRunnerParams<TResource>): ProtectCheckRunner {
  const card = useCardState();

  // Override for the module-LOAD bound only (see `executeProtectCheck`), resolved loader first
  // and instance second: a loader being rolled out gradually can carry its own value without
  // changing anything for browsers still on the loader it replaces. Undefined at both levels
  // leaves the SDK default in force. Read here rather than inside the effect so the effect keeps
  // depending on primitives.
  // Older clerk-js versions omit this getter; undefined preserves the instance/default fallback.
  const loaderTimeoutMs = useClerk().__internal_protectChallengeLoadTimeoutMs;
  const instanceTimeoutMs = useEnvironment().protectConfig?.challenge_load_timeout_ms;
  const loadTimeoutMs = loaderTimeoutMs ?? instanceTimeoutMs;

  // `handleError` re-throws what it does not recognise, and this runner awaits caller code that
  // raises plain errors (a transient fetch failure, an OAuth continuation that did not complete).
  const reportError = (err: any) => {
    try {
      handleError(err, [], card.setError);
    } catch {
      card.setError('Unable to complete action at this time. If the problem persists please contact support.');
    }
  };

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isRunningRef = React.useRef(false);
  // Identifies the most recent run, so a continuation can tell when a newer challenge replaced it.
  const runIdRef = React.useRef(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isWidgetVisible, setIsWidgetVisibleState] = React.useState(false);
  const [retryNonce, setRetryNonce] = React.useState(0);

  // Tracks real unmount, distinct from the per-run `cancelled` flag below. Clearing `protectCheck`
  // (e.g. an expired-challenge reload that advances the flow) flips the token dependency and
  // re-runs/cancels the main effect — but that re-run is exactly our cue to route, so the routing
  // must key on actual unmount, not on the effect's cancel flag.
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep the latest callbacks without re-running the effect when the caller re-renders.
  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  // Imported per run so a failed chunk load can be retried, and only behind the no-RHC flag so
  // those builds tree-shake the remote `import(sdk_url)` out.
  const runnerRef = React.useRef<ProtectCheckRunnerCore<TResource> | null>(null);
  const getRunner = async () => {
    const { ProtectCheckRunner } = await import('@clerk/shared/internal/clerk-js/protectCheckRunner');
    runnerRef.current ??= new ProtectCheckRunner<TResource>({
      getProtectCheck: () => paramsRef.current.getProtectCheck(),
      getResource: () => paramsRef.current.getResource(),
      reload: () => paramsRef.current.reload(),
      submitProtectCheck: p => paramsRef.current.submitProtectCheck(p),
    });
    return runnerRef.current;
  };

  const token = params.getProtectCheck()?.token;

  React.useEffect(() => {
    const { getProtectCheck, onResolved } = paramsRef.current;
    const protectCheck = getProtectCheck();
    if (!protectCheck || isRunningRef.current) {
      return;
    }

    const abortController = new AbortController();
    let cancelled = false;
    // Routing after the gate clears must survive the effect re-run that
    // clearing `protectCheck` triggers — that re-run is our cue to route, not a
    // reason to bail. So the onResolved paths below key on REAL unmount, not the
    // effect's per-run `cancelled` flag (which the re-run's cleanup sets).
    const isUnmounted = () => !mountedRef.current;

    const cleanup = () => {
      cancelled = true;
      abortController.abort();
      // Reset the guard so the next mount / token change / retry can re-run; this is what makes
      // chained challenges work correctly across re-renders.
      isRunningRef.current = false;
    };

    // The script owns the widget-visibility decision: it receives this callback in its init
    // payload (as `setWidgetVisible`) and calls it right before revealing UI in the container,
    // and again with `false` once its widget is done. flushSync so the returned promise only
    // resolves after the change is committed to the DOM — the caller's spinner is genuinely
    // gone when the script reveals its widget, with no frame of overlap (same guarantee
    // BaseRouter relies on flushSync for). Scoped to THIS run: the abort contract is
    // best-effort, so a zombie script from a timed-out, retried, or superseded run can still
    // call it late — those signals must not flip visibility under the active run.
    const setWidgetVisible = (visible: boolean): Promise<void> => {
      if (cancelled || abortController.signal.aborted || !mountedRef.current) {
        return Promise.resolve();
      }
      flushSync(() => setIsWidgetVisibleState(visible));
      return Promise.resolve();
    };

    // Fail closed in no-RHC builds (chrome extension / clerk.no-rhc.js): the gate requires a
    // remote `import(sdk_url)` we must not perform there. This guard MUST live in the component
    // layer. The runner is in `@clerk/shared`, compiled once with the flag hard-coded `false`,
    // so a guard there would never trip.
    if (__BUILD_DISABLE_RHC__) {
      isRunningRef.current = false;
      setIsRunning(false);
      handleError(
        new ClerkRuntimeError('Protect verification is not supported in this environment', {
          code: ERROR_CODES.PROTECT_CHECK_UNSUPPORTED_ENVIRONMENT,
        }),
        [],
        card.setError,
      );
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // The runner empties the container, so reset visibility now instead of waiting on the observer.
    setIsWidgetVisibleState(false);

    isRunningRef.current = true;
    setIsRunning(true);
    const runId = ++runIdRef.current;

    // Whether this run still owns the card's error and spinner. Until the gate clears, that ends
    // with the run's cancellation. Afterwards the continuation (`onResolved`) is still this run's
    // even though clearing the gate cancelled it, so it only stops owning them on unmount or when a
    // newer challenge has started a run of its own. Keying the continuation on `cancelled` swallowed
    // its failures and left the spinner running with no error.
    let continuing = false;
    const ownsOutcome = () => (continuing ? !isUnmounted() && runIdRef.current === runId : !cancelled);

    const runChallenge = async () => {
      try {
        if (__BUILD_DISABLE_RHC__) {
          return;
        }
        const runner = await getRunner();
        const outcome = await runner.run(protectCheck, {
          container,
          signal: abortController.signal,
          setWidgetVisible,
          loadTimeoutMs,
        });
        // A reissued challenge carries a new token, which re-runs this effect (keyed on the token).
        if (outcome.status === 'reissued' || isUnmounted()) {
          return;
        }
        continuing = true;
        await onResolved(outcome.resource, isUnmounted);
      } catch (err: any) {
        if (!ownsOutcome()) {
          return;
        }
        reportError(err);
      } finally {
        if (ownsOutcome()) {
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
    isRunningRef.current = false;
    runnerRef.current?.reset();

    // The gate already cleared and it was the continuation that failed: there is no challenge left
    // to re-run, so re-running the effect would do nothing. Retry the continuation instead.
    const { getProtectCheck, getResource, onResolved } = paramsRef.current;
    if (!getProtectCheck()) {
      const runId = ++runIdRef.current;
      const ownsOutcome = () => mountedRef.current && runIdRef.current === runId;
      isRunningRef.current = true;
      setIsRunning(true);
      void onResolved(getResource(), () => !mountedRef.current)
        .catch(err => {
          if (ownsOutcome()) {
            reportError(err);
          }
        })
        .finally(() => {
          if (ownsOutcome()) {
            isRunningRef.current = false;
            setIsRunning(false);
          }
        });
      return;
    }

    setRetryNonce(n => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, isRunning, isWidgetVisible, hasError: !!card.error, retry };
}
