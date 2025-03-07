import type { Clerk } from '@clerk/types';
import type { Dispatch, Reducer, ReducerAction, ReducerState } from 'react';
import { useMemo, useReducer, useRef } from 'react';

import { validateReverificationConfig } from '../../authorization';
import { isReverificationHint, reverificationError } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import { createDeferredPromise } from '../../utils/createDeferredPromise';
import { useClerk } from './useClerk';
import { useSafeLayoutEffect } from './useSafeLayoutEffect';

const CLERK_API_REVERIFICATION_ERROR_CODE = 'session_reverification_required';

async function resolveResult<T>(result: Promise<T> | T): Promise<T | ReturnType<typeof reverificationError>> {
  try {
    const r = await result;
    if (r instanceof Response) {
      return r.json();
    }
    return r;
  } catch (e) {
    // Treat fapi assurance as an assurance hint
    if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code === CLERK_API_REVERIFICATION_ERROR_CODE)) {
      return reverificationError();
    }

    // rethrow
    throw e;
  }
}

type ExcludeClerkError<T, P> = T extends { clerk_error: any } ? (P extends { throwOnCancel: true } ? never : null) : T;

/**
 * The optional options object.
 */
type UseReverificationOptions = {
  /**
   * If `false`, this won't automatically open the reverification modal and instead you need to use the necessary functions to control the reverification flow.
   *
   * @default true
   */
  defaultUI?: boolean;
  /**
   * If `true`, the action will throw an error if it fails or is cancelled.
   *
   * @default true
   */
  throwOnError?: boolean;
};

type ReverificationState = {
  level: string | undefined;
  inProgress: boolean;
  complete: () => void;
  cancel: () => void;
  error: Error | null;
};

const reverificationReducer: Reducer<
  ReverificationState,
  {
    type: 'setLevel' | 'setInProgress' | 'setComplete' | 'setCancel' | 'setError';
    value: any;
  }
> = (state, action) => {
  switch (action.type) {
    case 'setLevel':
      return { ...state, level: action.value };
    case 'setInProgress':
      return { ...state, inProgress: action.value };
    case 'setComplete':
      return { ...state, complete: action.value };
    case 'setCancel':
      return { ...state, cancel: action.value };
    case 'setError':
      return { ...state, error: action.value };
    default:
      return state;
  }
};

type CreateReverificationHandlerParams = UseReverificationOptions & {
  openUIComponent: Clerk['__internal_openReverification'];
  reverificationState: [
    ReducerState<typeof reverificationReducer>,
    Dispatch<ReducerAction<typeof reverificationReducer>>,
  ];
};

function createReverificationHandler(params: CreateReverificationHandlerParams) {
  function assertReverification<Fetcher extends (...args: any[]) => Promise<any> | undefined>(
    fetcher: Fetcher,
  ): (
    ...args: Parameters<Fetcher>
  ) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Parameters<Fetcher>[1]>> {
    return (async (...args: Parameters<Fetcher>) => {
      let result = await resolveResult(fetcher(...args));

      if (isReverificationHint(result)) {
        /**
         * Create a promise
         */
        const resolvers = createDeferredPromise();

        const isValidMetadata = validateReverificationConfig(result.clerk_error.metadata?.reverification);

        const [state, dispatch] = params.reverificationState;
        dispatch({ type: 'setLevel', value: isValidMetadata ? isValidMetadata().level : undefined });
        dispatch({ type: 'setInProgress', value: true });
        dispatch({
          type: 'setComplete',
          value: () => {
            return () => resolvers.resolve(true);
          },
        });
        dispatch({
          type: 'setCancel',
          value: () => {
            return () =>
              resolvers.reject(
                new ClerkRuntimeError('User cancelled attempted verification', {
                  code: 'reverification_cancelled',
                }),
              );
          },
        });

        if (params.defaultUI) {
          /**
           * On success resolve the pending promise
           * On cancel reject the pending promise
           */
          params.openUIComponent?.({
            level: isValidMetadata ? isValidMetadata().level : undefined,
            afterVerification() {
              state.complete();
            },
            afterVerificationCancelled() {
              state.cancel();
            },
          });
        }

        try {
          /**
           * Wait until the promise from above have been resolved or rejected
           */
          await resolvers.promise;
        } catch (e) {
          dispatch({ type: 'setError', value: e });
          if (params.throwOnError) {
            throw e;
          }

          return null;
        } finally {
          dispatch({ type: 'setInProgress', value: false });
        }

        /**
         * After the promise resolved successfully try the original request one more time
         */
        result = await resolveResult(fetcher(...args));
      }

      return result;
    }) as ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Parameters<Fetcher>[1]>;
  }

  return assertReverification;
}

type UseReverificationResult<
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
> = {
  action: (...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Options>>;
  inProgress: boolean;
  level: string | undefined;
  cancel: () => void;
  complete: () => void;
  error: Error | null;
};

/**
 * The `useReverification()` hook is used to handle a session's reverification flow. If a request requires reverification, a modal will display, prompting the user to verify their credentials. Upon successful verification, the original request will automatically retry.
 *
 * @warning
 *
 * This feature is currently in public beta. **It is not recommended for production use.**
 *
 * Depending on the SDK you're using, this feature requires `@clerk/nextjs@6.5.0` or later, `@clerk/clerk-react@5.17.0` or later, and `@clerk/clerk-js@5.35.0` or later.
 *
 * @example
 * ### Handle cancellation of the reverification process
 *
 * The following example demonstrates how to handle scenarios where a user cancels the reverification flow, such as closing the modal, which might result in `myData` being `null`.
 *
 * In the following example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/reverification) for more information.
 *
 * ```tsx {{ filename: 'src/components/MyButton.tsx' }}
 * import { useReverification } from '@clerk/react'
 * import { isClerkRuntimeError } from '@clerk/clerk-react/errors'
 *
 * export function MyButton() {
 *   const { action: enhancedFetcher, error } = useReverification(myFetcher)
 *
 *   const handleClick = async () => {
 *     const myData = await enhancedFetcher()
 *
 *    if (isClerkRuntimeError(e) && e.code === 'reverification_cancelled') {
 *      // User has cancelled reverification
 *    }
 *
 *     if (!myData) return
 *   }
 *
 *   return <button onClick={handleClick}>Update User</button>
 * }
 * ```
 *
 * @example
 * ### Handle `throwOnError`
 *
 * When `throwOnError` is set to `true`, the fetcher will throw all errors. This error can be caught and handled according to your app's needs. For example, by displaying a toast notification to the user.
 *
 * In this example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/reverification) for more information.
 *
 * ```tsx {{ filename: 'src/components/MyButton.tsx' }}
 * import { useReverification } from '@clerk/clerk-react'
 * import { isClerkRuntimeError } from '@clerk/clerk-react/errors'
 *
 * export function MyButton() {
 *   const { action: enhancedFetcher } = useReverification(myFetcher, { throwOnCancel: true })
 *
 *   const handleClick = async () => {
 *     try {
 *       const myData = await enhancedFetcher()
 *     } catch (e) {
 *       // Handle if user cancels the reverification process
 *       if (isClerkRuntimeError(e) && e.code === 'reverification_cancelled') {
 *         console.error('User cancelled reverification', e.code)
 *       }
 *     }
 *   }
 *
 *   return <button onClick={handleClick}>Update user</button>
 * }
 * ```
 */
function useReverification<
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
>(fetcher: Fetcher, options?: Options): UseReverificationResult<Fetcher, Options> {
  const defaultOptions = {
    ...options,
    defaultUI: true,
    throwOnError: true,
  };
  const clerk = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(defaultOptions);
  const [state, dispatch] = useReducer(reverificationReducer, {
    level: undefined,
    inProgress: false,
    complete: () => {},
    cancel: () => {},
    error: null,
  });
  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      openUIComponent: clerk.__internal_openReverification,
      reverificationState: [state, dispatch],
      ...optionsRef.current,
    })(fetcherRef.current);
    return handler;
  }, []);

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = defaultOptions;
  });

  return {
    action: handleReverification,
    inProgress: state.inProgress,
    level: state.level,
    cancel: state.cancel,
    complete: state.cancel,
    error: state.error,
  };
}

export { useReverification };
