import { isReverificationCancelledError } from '@clerk/shared/error';
import { useEffect, useRef, useState } from 'react';

import type { ErrorDescription } from '../localization';
import { useErrorText } from '../localization';
import { toLocalizableError } from '../utils/errors';

export interface PendingActionOptions {
  /** Copy shown when the action fails without an error Clerk can describe, such as a network or code fault (default: the generic error) */
  errorFallback?: string;
}

export interface PendingAction<TKey extends string> {
  run: (
    key: TKey,
    action: (signal: AbortSignal) => Promise<unknown> | void,
    options?: PendingActionOptions,
  ) => Promise<boolean>;
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

/**
 * Runs inline actions, such as row buttons, under one lock and tracks which key is pending, which key ran last, and which key last failed.
 * `run` resolves `true` on success and `false` on failure or cancellation, ignores calls while a run owns the lock, and clears the last error when it starts.
 * Unmount aborts the action signal; callers guard their own side effects and completion UI.
 */
export function usePendingAction<TKey extends string = string>({
  errorFallback,
}: PendingActionOptions = {}): PendingAction<TKey> {
  const errorText = useErrorText();
  const [pendingKey, setPendingKey] = useState<TKey>();
  const [lastKey, setLastKey] = useState<TKey>();
  const [failure, setFailure] = useState<PendingActionFailure<TKey>>();
  const running = useRef<AbortController>();

  useEffect(
    () => () => {
      running.current?.abort();
      running.current = undefined;
    },
    [],
  );

  const run = async (
    key: TKey,
    action: (signal: AbortSignal) => Promise<unknown> | void,
    options: PendingActionOptions = {},
  ) => {
    if (running.current) {
      return false;
    }
    const controller = new AbortController();
    running.current = controller;
    setPendingKey(key);
    setLastKey(key);
    setFailure(undefined);
    try {
      await action(controller.signal);
      return !controller.signal.aborted;
    } catch (cause) {
      if (!controller.signal.aborted && !isReverificationCancelledError(cause)) {
        setFailure({ key, error: toLocalizableError(cause), errorFallback: options.errorFallback });
      }
      return false;
    } finally {
      if (running.current === controller) {
        running.current = undefined;
        setPendingKey(undefined);
      }
    }
  };

  return {
    run,
    pendingKey,
    lastKey,
    isPending: pendingKey !== undefined,
    error: failure ? errorText(failure.error, failure.errorFallback ?? errorFallback) : undefined,
    errorKey: failure?.key,
    reset: () => setFailure(undefined),
  };
}
