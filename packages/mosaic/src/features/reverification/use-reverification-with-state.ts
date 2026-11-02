import { ClerkRuntimeError } from '@clerk/shared/error';
import {
  __internal_createReverificationHandler,
  useClerk,
  type useReverification,
  useSafeLayoutEffect,
} from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import { useCallback, useRef, useState } from 'react';

import type { ReverificationState } from './reverification.types';

export type ReverificationFetcher = Parameters<typeof useReverification>[0];

export type UseReverificationWithStateResult<F extends ReverificationFetcher = ReverificationFetcher> = readonly [
  ReturnType<typeof useReverification<F>>,
  ReverificationState,
];

type ReverificationRun = {
  sessionId: string;
  abort: AbortController;
};

export function useReverificationWithState<F extends ReverificationFetcher>(
  fetcher: F,
): UseReverificationWithStateResult<F> {
  const clerk = useClerk();
  clerk.telemetry?.record(eventMethodCalled('useReverification', { onNeedsReverification: true }));
  const [reverificationState, setReverificationState] = useState<ReverificationState>({ phase: 'inactive' });
  const currentRun = useRef<ReverificationRun | null>(null);
  const fetcherRef = useRef(fetcher);

  const cancelRun = useCallback((run: ReverificationRun) => {
    if (currentRun.current !== run) {
      return;
    }
    currentRun.current = null;
    setReverificationState({ phase: 'inactive' });
    run.abort.abort(
      new ClerkRuntimeError('User cancelled attempted verification', { code: 'reverification_cancelled' }),
    );
  }, []);

  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  useSafeLayoutEffect(() => {
    const unsubscribe = clerk.addListener(({ session }) => {
      const run = currentRun.current;
      if (!run) {
        return;
      }
      if (session === null || (session !== undefined && session.id !== run.sessionId)) {
        cancelRun(run);
      }
    });
    return () => {
      unsubscribe();
      const run = currentRun.current;
      if (run) {
        cancelRun(run);
      }
    };
  }, [clerk, cancelRun]);

  const singleFlight = useCallback(
    (...args: Parameters<F>) => {
      if (currentRun.current) {
        return Promise.reject(
          new ClerkRuntimeError('A request is already in progress.', { code: 'request_already_in_progress' }),
        );
      }

      const sessionId = clerk.session?.id;
      if (!sessionId) {
        return Promise.reject(
          new ClerkRuntimeError('User cancelled attempted verification', { code: 'reverification_cancelled' }),
        );
      }

      const run: ReverificationRun = {
        sessionId,
        abort: new AbortController(),
      };
      currentRun.current = run;
      const handler = __internal_createReverificationHandler({
        openUIComponent: clerk.__internal_openReverification,
        telemetry: clerk.telemetry,
        signal: run.abort.signal,
        onNeedsReverification: ({ complete, level }) => {
          if (currentRun.current !== run) {
            return;
          }
          setReverificationState({
            phase: 'active',
            level,
            signal: run.abort.signal,
            sessionId: run.sessionId,
            complete: () => {
              if (currentRun.current !== run) {
                return;
              }
              setReverificationState({ phase: 'retrying', signal: run.abort.signal });
              complete();
            },
            cancel: () => cancelRun(run),
          });
        },
      })(fetcherRef.current);
      const invocation = handler(...args);
      void invocation
        .finally(() => {
          if (currentRun.current === run) {
            currentRun.current = null;
            setReverificationState({ phase: 'inactive' });
          }
        })
        .catch(() => undefined);
      return invocation;
    },
    [clerk, cancelRun],
  );

  return [singleFlight, reverificationState];
}
