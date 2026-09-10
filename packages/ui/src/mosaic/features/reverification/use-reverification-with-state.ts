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
  const activeCancelRef = useRef<(() => void) | undefined>(undefined);

  const wrapped = useReverification(fetcher, {
    ...options,
    onNeedsReverification: ({ complete, cancel, level }) => {
      // If another Reverification is already in progress for this specific
      // wrapped action, cancel this new one immediately and keep the old one.
      // This is an extra safeguard for something that likely never happens.
      if (activeCancelRef.current) {
        cancel();
        return;
      }

      openedSessionId.current = session?.id ?? null;
      activeCancelRef.current = cancel;

      const settle = (callback: () => void) => {
        if (activeCancelRef.current !== cancel) {
          return;
        }
        activeCancelRef.current = undefined;
        setReverificationState({ isActive: false });
        callback();
      };

      setReverificationState({
        isActive: true,
        level,
        complete: () => settle(complete),
        cancel: () => settle(cancel),
      });
    },
  });

  // Cancel if the session changes mid-flight
  const { isActive, cancel } = reverificationState;
  useEffect(() => {
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
      const cancel = activeCancelRef.current;
      activeCancelRef.current = undefined;
      cancel?.();
    };
  }, []);

  return [wrapped, reverificationState];
}
