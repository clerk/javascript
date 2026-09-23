import { ClerkRuntimeError } from '@clerk/shared/error';
import { useReverification, useSafeLayoutEffect, useSession } from '@clerk/shared/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ReverificationState } from './reverification.types';

export type ReverificationFetcher = (...args: any[]) => Promise<any> | undefined;

type UseReverificationOptions = NonNullable<Parameters<typeof useReverification>[1]>;

export type UseReverificationWithStateOptions = Omit<UseReverificationOptions, 'onNeedsReverification'>;

export type UseReverificationWithStateResult<F extends ReverificationFetcher = ReverificationFetcher> = readonly [
  ReturnType<typeof useReverification<F>>,
  ReverificationState,
];

type RuntimeOperation =
  | { status: 'idle' }
  | { status: 'requesting'; promise: Promise<unknown> }
  | {
      status: 'active';
      promise: Promise<unknown>;
      sessionId: string | null;
      complete: () => void;
      cancel: () => void;
    }
  | { status: 'retrying'; promise: Promise<unknown> }
  | { status: 'cancelling'; promise: Promise<unknown> };

type Runtime = {
  operation: RuntimeOperation;
  sessionId: string | null;
};

const REQUEST_ALREADY_IN_PROGRESS_CODE = 'request_already_in_progress';

function requestAlreadyInProgressError(): ClerkRuntimeError {
  return new ClerkRuntimeError('A request is already in progress.', {
    code: REQUEST_ALREADY_IN_PROGRESS_CODE,
  });
}

/**
 * This wraps useReverification, but does not pop the default UI and instead manages
 * the lifecycle, use the returned `phase` and callbacks to build your custom UI.
 *
 * useReverificationFlow pairs this lifecycle with <Reverification>.
 *
 * In contrast to useReverification, the returned handler is only allowed to run
 * in serial. Any new calls that happen while it's still pending will throw
 * request_already_in_progress. If you always guard against double-invocation,
 * you wont see this error.
 */
// The reason we need to enforce single-flight is that we need a direct link between
// a single invocation of the handler and a specific reverification. useReverification
// does not have well-defined behavior for concurrent calls, so we add the single-flight
// constraint for extra safeguards here.
// If we ever want to make this hook public API, we might want to reconsider the single-flight
// behavior by first fixing the useReverification hook.
export function useReverificationWithState<F extends ReverificationFetcher>(
  fetcher: F,
  options?: UseReverificationWithStateOptions,
): UseReverificationWithStateResult<F> {
  const { session } = useSession();
  // The return is observable and needs to be driven by React state
  const [reverificationState, setReverificationState] = useState<ReverificationState>({ phase: 'inactive' });
  // State updates are not immediate and since parallel requests can resolve before observing
  // those state changes, the internal state is driven by a ref
  const runtimeRef = useRef<Runtime>({
    operation: { status: 'idle' },
    sessionId: session?.id ?? null,
  });
  useSafeLayoutEffect(() => {
    runtimeRef.current.sessionId = session?.id ?? null;
  });

  const completeChallenge = useCallback(() => {
    const operation = runtimeRef.current.operation;
    if (operation.status !== 'active') {
      return;
    }
    runtimeRef.current.operation = { status: 'retrying', promise: operation.promise };
    setReverificationState({ phase: 'retrying' });
    operation.complete();
  }, []);

  const cancelChallenge = useCallback(() => {
    const operation = runtimeRef.current.operation;
    if (operation.status !== 'active') {
      return;
    }
    runtimeRef.current.operation = { status: 'cancelling', promise: operation.promise };
    setReverificationState({ phase: 'inactive' });
    operation.cancel();
  }, []);

  const wrapped = useReverification(fetcher, {
    ...options,
    onNeedsReverification: ({ complete, cancel, level }) => {
      const operation = runtimeRef.current.operation;
      if (operation.status !== 'requesting') {
        return;
      }

      runtimeRef.current.operation = {
        status: 'active',
        promise: operation.promise,
        sessionId: runtimeRef.current.sessionId,
        complete,
        cancel,
      };

      setReverificationState({
        phase: 'active',
        level,
        complete: completeChallenge,
        cancel: cancelChallenge,
      });
    },
  });

  const singleFlight = useCallback(
    (...args: Parameters<F>) => {
      // Only a single handler call is allowed to be in progress at the same time
      if (runtimeRef.current.operation.status !== 'idle') {
        return Promise.reject(requestAlreadyInProgressError());
      }

      const invocation = Promise.resolve().then(() => wrapped(...args));
      runtimeRef.current.operation = { status: 'requesting', promise: invocation };
      void invocation
        .finally(() => {
          const operation = runtimeRef.current.operation;
          if (operation.status === 'idle' || operation.promise !== invocation) {
            return;
          }
          runtimeRef.current.operation = { status: 'idle' };
          setReverificationState({ phase: 'inactive' });
        })
        // The original error is meant to be handled outside, but .finally() creates
        // a new promise that errors the same way, so we swallow that duplicate error silently
        .catch(() => undefined);

      return invocation;
    },
    [wrapped],
  ) as ReturnType<typeof useReverification<F>>;

  const phase = reverificationState.phase;
  useEffect(() => {
    if (phase !== 'active') {
      return;
    }
    const operation = runtimeRef.current.operation;
    if (operation.status !== 'active') {
      return;
    }
    // Do not reset on the transitive state
    if (session === undefined) {
      return;
    }
    if (session === null) {
      cancelChallenge();
      return;
    }
    // If operation started before sessionId was known, we record it here
    if (operation.sessionId === null) {
      runtimeRef.current.operation = { ...operation, sessionId: session.id };
      return;
    }
    if (session.id !== operation.sessionId) {
      cancelChallenge();
    }
  }, [phase, session, cancelChallenge]);

  // Cancel on unmount - Does not cancel ongoing retry after reverification has finished
  useEffect(() => {
    const runtime = runtimeRef.current;
    return () => {
      const operation = runtime.operation;
      runtime.operation = { status: 'idle' };
      if (operation.status === 'active') {
        operation.cancel();
      }
    };
  }, []);

  return [singleFlight, reverificationState];
}
