import { useReverification, useSession } from '@clerk/shared/react';
import { useEffect, useRef, useState } from 'react';

import type { ReverificationProps } from './reverification.types';

type Fetcher = (...args: any[]) => Promise<any> | undefined;

type UseReverificationOptions = NonNullable<Parameters<typeof useReverification>[1]>;

export type UseReverificationWithStateOptions = Omit<UseReverificationOptions, 'onNeedsReverification'>;

export type UseReverificationWithStateResult<F extends Fetcher = Fetcher> = readonly [
  ReturnType<typeof useReverification<F>>,
  ReverificationProps,
];

/**
 * Same fetcher wrap as `useReverification`, with the need-reverification callback
 * returned as `ReverificationProps` instead of `onNeedsReverification`.
 */
export function useReverificationWithState<F extends Fetcher>(
  fetcher: F,
  options?: UseReverificationWithStateOptions,
): UseReverificationWithStateResult<F> {
  const { session } = useSession();
  const [reverificationState, setReverificationState] = useState<ReverificationProps>({ isActive: false });
  const openedSessionId = useRef<string | null>(null);
  const cancelOnUnmountRef = useRef<(() => void) | undefined>(undefined);

  const wrapped = useReverification(fetcher, {
    ...options,
    onNeedsReverification: ({ complete, cancel, level }) => {
      openedSessionId.current = session?.id ?? null;
      setReverificationState({
        isActive: true,
        level,
        complete: () => {
          setReverificationState({ isActive: false });
          complete();
        },
        cancel: () => {
          setReverificationState({ isActive: false });
          cancel();
        },
      });
    },
  });

  // Cancel if the session changes mid-flight
  const { isActive, cancel } = reverificationState;
  useEffect(() => {
    cancelOnUnmountRef.current = isActive ? cancel : undefined;

    if (!isActive) {
      openedSessionId.current = null;
      return;
    }
    // Do not reset on the transitive state
    if (session === undefined) {
      return;
    }
    if (session === null) {
      cancel?.();
      return;
    }
    if (openedSessionId.current === null) {
      openedSessionId.current = session.id;
      return;
    }
    if (session.id !== openedSessionId.current) {
      cancel?.();
    }
  }, [isActive, cancel, session]);

  useEffect(() => {
    return () => {
      cancelOnUnmountRef.current?.();
    };
  }, []);

  return [wrapped, reverificationState];
}
