import { isReverificationCancelledError } from '@clerk/shared/error';
import { useState } from 'react';

import type { ErrorDescription } from '../localization';
import { useErrorText } from '../localization';
import { toLocalizableError } from '../utils/errors';
import type { ActionLock } from './use-action-lock';
import { useActionLock } from './use-action-lock';

export interface PendingActionOptions {
  /** Copy shown when the action fails without an error Clerk can describe, such as a network or code fault (default: the generic error) */
  errorFallback?: string;
}

export interface PendingActionHookOptions extends PendingActionOptions {
  actionLock?: ActionLock;
}

export interface PendingAction<TKey extends string> {
  run: (key: TKey, action: () => Promise<unknown> | void, options?: PendingActionOptions) => Promise<boolean>;
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
 * `run` resolves `true` on success and `false` on failure, ignores calls while any run is in flight, and clears the last error when it starts.
 */
export function usePendingAction<TKey extends string = string>({
  errorFallback,
  actionLock,
}: PendingActionHookOptions = {}): PendingAction<TKey> {
  const errorText = useErrorText();
  const [pendingKey, setPendingKey] = useState<TKey>();
  const [lastKey, setLastKey] = useState<TKey>();
  const [failure, setFailure] = useState<PendingActionFailure<TKey>>();
  const localLock = useActionLock();
  const lock = actionLock ?? localLock;

  const run = async (key: TKey, action: () => Promise<unknown> | void, options: PendingActionOptions = {}) => {
    return (
      lock.tryRun(async () => {
        setPendingKey(key);
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
        } finally {
          setPendingKey(undefined);
        }
      }) ?? false
    );
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
