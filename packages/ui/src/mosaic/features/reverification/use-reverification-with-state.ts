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
  const [props, setProps] = useState<ReverificationProps>({ isActive: false });
  const openedSessionId = useRef<string | null>(null);

  const wrapped = useReverification(fetcher, {
    ...options,
    onNeedsReverification: ({ complete, cancel, level }) => {
      openedSessionId.current = session?.id ?? null;
      setProps({
        isActive: true,
        level,
        complete: () => {
          setProps({ isActive: false });
          complete();
        },
        cancel: () => {
          setProps({ isActive: false });
          cancel();
        },
      });
    },
  });

  // Cancel if the session changes mid-flight
  const { isActive, cancel } = props;
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

  return [wrapped, props];
}
