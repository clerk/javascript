import { ClerkRuntimeError } from '@clerk/shared/error';
import { useReverification, useSafeLayoutEffect, useSession } from '@clerk/shared/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ReverificationState } from './reverification.types';

export type ReverificationFetcher = (...args: any[]) => Promise<any> | undefined;

export type UseReverificationWithStateResult<F extends ReverificationFetcher = ReverificationFetcher> = readonly [
  ReturnType<typeof useReverification<F>>,
  ReverificationState,
  () => void,
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

function releaseSettled(state: ReverificationState): ReverificationState {
  return state.phase === 'settled' ? { phase: 'inactive' } : state;
}

const REQUEST_ALREADY_IN_PROGRESS_CODE = 'request_already_in_progress';

function requestAlreadyInProgressError(): ClerkRuntimeError {
  return new ClerkRuntimeError('A request is already in progress.', {
    code: REQUEST_ALREADY_IN_PROGRESS_CODE,
  });
}

/**
 * Wraps useReverification without the default UI. Returns [handler, state]: call handler
 * to run the action, and render your own UI from state.phase ('inactive' | 'active' |
 * 'retrying' | 'settled'). While 'active', state.complete and state.cancel end the challenge.
 *
 * A run that was interrupted by a reverification ends in 'settled', not 'inactive', so the
 * UI that was showing can be held until the caller moves on. 'settled' ends when the handler
 * is called again, or when the third return value, reset, is called. A run that was never
 * interrupted stays 'inactive' throughout.
 *
 * The handler runs one call at a time. A call made while another is pending rejects with a
 * ClerkRuntimeError with code 'request_already_in_progress'.
 */
// The reason we need to enforce single-flight is that we need a direct link between
// a single invocation of the handler and a specific reverification. useReverification
// does not have well-defined behavior for concurrent calls, so we add the single-flight
// constraint for extra safeguards here.
// If we ever want to make this hook public API, we might want to reconsider the single-flight
// behavior by first fixing the useReverification hook.
export function useReverificationWithState<F extends ReverificationFetcher>(
  fetcher: F,
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
    setReverificationState({ phase: 'settled' });
    operation.cancel();
  }, []);

  const wrapped = useReverification(fetcher, {
    onNeedsReverification: ({ complete, cancel, level }) => {
      const operation = runtimeRef.current.operation;
      if (operation.status !== 'requesting') {
        // This can happen e.g. when the component unmounts mid-flight
        cancel();
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

      setReverificationState(releaseSettled);

      const invocation = Promise.resolve().then(() => wrapped(...args));
      runtimeRef.current.operation = { status: 'requesting', promise: invocation };
      void invocation
        .finally(() => {
          const operation = runtimeRef.current.operation;
          if (operation.status === 'idle' || operation.promise !== invocation) {
            return;
          }
          runtimeRef.current.operation = { status: 'idle' };
          setReverificationState({ phase: operation.status === 'requesting' ? 'inactive' : 'settled' });
        })
        // The original error is meant to be handled outside, but .finally() creates
        // a new promise that errors the same way, so we swallow that duplicate error silently
        .catch(() => undefined);

      return invocation;
    },
    [wrapped],
  ) as ReturnType<typeof useReverification<F>>;

  const reset = useCallback(() => {
    if (runtimeRef.current.operation.status !== 'idle') {
      return;
    }
    setReverificationState(releaseSettled);
  }, []);

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

  return [singleFlight, reverificationState, reset];
}
