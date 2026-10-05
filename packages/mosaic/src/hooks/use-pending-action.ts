import { useRef, useState } from 'react';

import type { LocalizableError } from '../localization';
import { useErrorText } from '../localization';
import { toLocalizableError } from '../utils/form-error';

export interface PendingActionOptions {
  /** Copy shown when the action fails without an error Clerk can describe, such as a network or code fault (default: the generic error) */
  errorFallback?: string;
}

export interface PendingAction<TArgs extends unknown[]> {
  run: (...args: TArgs) => Promise<boolean>;
  isPending: boolean;
  errorMessage: string | undefined;
  reset: () => void;
}

/**
 * Runs an inline action, such as a row button, and tracks whether it is pending and why it failed.
 * `run` resolves `true` on success and `false` on failure, and ignores calls while one is in flight.
 */
export function usePendingAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<unknown> | void,
  { errorFallback }: PendingActionOptions = {},
): PendingAction<TArgs> {
  const errorText = useErrorText();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<LocalizableError>();
  const running = useRef(false);

  const run = async (...args: TArgs) => {
    if (running.current) {
      return false;
    }
    running.current = true;
    setIsPending(true);
    setError(undefined);
    try {
      await action(...args);
      return true;
    } catch (cause) {
      setError(toLocalizableError(cause));
      return false;
    } finally {
      running.current = false;
      setIsPending(false);
    }
  };

  return {
    run,
    isPending,
    errorMessage: error ? errorText(error, errorFallback) : undefined,
    reset: () => setError(undefined),
  };
}
