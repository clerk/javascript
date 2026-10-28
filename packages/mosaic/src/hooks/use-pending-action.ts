import { isReverificationCancelledError } from '@clerk/shared/error';
import { useRef, useState } from 'react';

import type { ErrorDescription } from '../localization';
import { useErrorText } from '../localization';
import { toLocalizableError } from '../utils/errors';

export interface PendingActionOptions {
  /** Copy shown when the action fails without an error Clerk can describe, such as a network or code fault (default: the generic error) */
  errorFallback?: string;
}

export interface PendingAction<TKey extends string> {
  run: (key: TKey, action: () => Promise<unknown> | void, options?: PendingActionOptions) => Promise<boolean>;
  runExternal: <T>(action: () => T | Promise<T>) => Promise<T> | undefined;
  pendingKey: TKey | undefined;
  lastKey: TKey | undefined;
  isPending: boolean;
  error: string | undefined;
  errorKey: TKey | undefined;
  reset: () => void;
}

interface PendingActionFailure<TKey extends string> {
  key: TKey;
  error: ErrorDescription;
  errorFallback: string | undefined;
}

type Pending<TKey> = { kind: 'inline'; key: TKey } | { kind: 'external' };

/**
 * Runs inline and external actions under one lock and tracks which inline key is pending, ran last, or last failed.
 * `run` resolves `true` on success and `false` on failure, ignores calls while any action is in flight, and clears the last error when it starts.
 */
export function usePendingAction<TKey extends string = string>({
  errorFallback,
}: PendingActionOptions = {}): PendingAction<TKey> {
  const errorText = useErrorText();
  const running = useRef(false);
  const [pending, setPending] = useState<Pending<TKey>>();
  const [lastKey, setLastKey] = useState<TKey>();
  const [failure, setFailure] = useState<PendingActionFailure<TKey>>();

  const claim = <T>(next: Pending<TKey>, action: () => T | Promise<T>): Promise<T> | undefined => {
    if (running.current) {
      return undefined;
    }
    running.current = true;
    setPending(next);
    return (async () => {
      try {
        return await action();
      } finally {
        running.current = false;
        setPending(undefined);
      }
    })();
  };

  const run = async (key: TKey, action: () => Promise<unknown> | void, options: PendingActionOptions = {}) => {
    return (
      claim({ kind: 'inline', key }, async () => {
        setLastKey(key);
        setFailure(undefined);
        try {
          await action();
          return true;
        } catch (cause) {
          if (!isReverificationCancelledError(cause)) {
            setFailure({ key, error: toLocalizableError(cause), errorFallback: options.errorFallback });
          }
          return false;
        }
      }) ?? false
    );
  };

  return {
    run,
    runExternal: action => claim({ kind: 'external' }, action),
    pendingKey: pending?.kind === 'inline' ? pending.key : undefined,
    lastKey,
    isPending: pending !== undefined,
    error: failure ? errorText(failure.error, failure.errorFallback ?? errorFallback) : undefined,
    errorKey: failure?.key,
    reset: () => setFailure(undefined),
  };
}
