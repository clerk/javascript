import { useSafeLayoutEffect } from '@clerk/shared/react';
import { useCallback, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

export type ActionState = { status: 'idle' } | { status: 'running' } | { status: 'failed'; error: unknown };

export type ActionResult<T> =
  | { status: 'done'; value: T }
  | { status: 'cancelled' }
  | { status: 'failed'; error: unknown };

export type ActionContext = {
  cancelled: () => never;
  onSettled: (callback: (result: ActionResult<unknown>) => void) => void;
};

export type Action<Args extends unknown[], T> = {
  state: ActionState;
  run: (...args: Args) => Promise<ActionResult<T>>;
  reset: () => void;
};

class ActionCancelledError extends Error {}

export function useAction<Args extends unknown[], T>(
  fn: (ctx: ActionContext, ...args: Args) => Promise<T>,
): Action<Args, T> {
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const fnRef = useRef(fn);
  const inFlight = useRef<Promise<ActionResult<T>> | null>(null);

  useSafeLayoutEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback((...args: Args) => {
    if (inFlight.current) {
      return inFlight.current;
    }

    const settledCallbacks: ((result: ActionResult<unknown>) => void)[] = [];
    const ctx: ActionContext = {
      cancelled: () => {
        throw new ActionCancelledError();
      },
      onSettled: callback => {
        settledCallbacks.push(callback);
      },
    };

    const settle = (result: ActionResult<T>) => {
      inFlight.current = null;
      unstable_batchedUpdates(() => {
        setState(result.status === 'failed' ? { status: 'failed', error: result.error } : { status: 'idle' });
        settledCallbacks.forEach(callback => callback(result));
      });
      return result;
    };

    setState({ status: 'running' });
    const promise = new Promise<T>(resolve => resolve(fnRef.current(ctx, ...args)))
      .then(
        (value): ActionResult<T> => ({ status: 'done', value }),
        (error: unknown): ActionResult<T> =>
          error instanceof ActionCancelledError ? { status: 'cancelled' } : { status: 'failed', error },
      )
      .then(settle);
    inFlight.current = promise;
    return promise;
  }, []);

  const reset = useCallback(() => {
    setState(current => (current.status === 'failed' ? { status: 'idle' } : current));
  }, []);

  return { state, run, reset };
}
