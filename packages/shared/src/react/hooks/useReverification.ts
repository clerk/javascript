import type { Clerk, SessionVerificationLevel } from '@clerk/types';
import { useRef, useState } from 'react';

import { validateReverificationConfig } from '../../authorization';
import { isReverificationHint, reverificationError } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import { createDeferredPromise } from '../../utils';
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
 * The `useReverification` hook options
 *
 * @interface
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

/**
 * @interface
 */
type UseReverificationResult<
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
> = {
  /**
   * The action that will trigger the fetcher and handle the reverification flow if necessary.
   */
  action: (...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Options>>;

  /**
   * A boolean indicating if the reverification process is in progress.
   */
  inProgress: boolean;

  /**
   * The level of reverification required.
   */
  level: SessionVerificationLevel | undefined;

  /**
   * A function to cancel the reverification process.
   */
  cancel: () => void;

  /**
   * A function to complete the reverification process.
   */
  complete: () => void;

  /**
   * An error that occurred during the reverification process or from the fetcher.
   */
  error: Error | undefined;
};

/**
 * @interface
 */
type UseReverification = <
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
>(
  fetcher: Fetcher,
  options?: Options,
) => UseReverificationResult<Fetcher, Options>;

type CreateReverificationHandlerParams = UseReverificationOptions & {
  openUIComponent: Clerk['__internal_openReverification'];
};

function useCreateReverificationHandler(params: CreateReverificationHandlerParams) {
  const [level, setLevel] = useState<SessionVerificationLevel | undefined>(undefined);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [complete, setComplete] = useState<() => void>(() => {});
  const [cancel, setCancel] = useState<() => void>(() => {});

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

        setLevel(isValidMetadata ? isValidMetadata().level : undefined);
        setInProgress(true);
        setComplete(() => {
          return () => {
            resolvers.resolve(true);
          };
        });
        setCancel(() => {
          return () => {
            resolvers.reject(
              new ClerkRuntimeError('User cancelled attempted verification', {
                code: 'reverification_cancelled',
              }),
            );
          };
        });

        if (params.defaultUI) {
          /**
           * On success resolve the pending promise
           * On cancel reject the pending promise
           */
          params.openUIComponent?.({
            level: isValidMetadata ? isValidMetadata().level : undefined,
            afterVerification() {
              resolvers.resolve(true);
            },
            afterVerificationCancelled() {
              resolvers.reject(
                new ClerkRuntimeError('User cancelled attempted verification', {
                  code: 'reverification_cancelled',
                }),
              );
            },
          });
        }

        try {
          /**
           * Wait until the promise from above have been resolved or rejected
           */
          await resolvers.promise;
        } catch (e) {
          setError(e as Error);
          if (params.throwOnError) {
            throw e;
          }

          return null;
        } finally {
          setInProgress(false);
        }

        /**
         * After the promise resolved successfully try the original request one more time
         */
        result = await resolveResult(fetcher(...args));
      }

      return result;
    }) as ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Parameters<Fetcher>[1]>;
  }

  return {
    assertReverification,
    state: {
      level,
      inProgress,
      error,
      complete,
      cancel,
    },
  };
}
/**
 * > [!WARNING]
 * > This feature is currently in public beta. **It is not recommended for production use.**
 * >
 * > Depending on the SDK you're using, this feature requires `@clerk/nextjs@6.5.0` or later, `@clerk/clerk-react@5.17.0` or later, and `@clerk/clerk-js@5.35.0` or later.
 *
 * The `useReverification()` hook is used to handle a session's reverification flow. If a request requires reverification, a modal will display, prompting the user to verify their credentials. Upon successful verification, the original request will automatically retry.
 *
 * @returns The `useReverification()` hook returns an array with the "enhanced" fetcher.
 *
 * @example
 * ### Handle cancellation of the reverification process
 *
 * The following example demonstrates how to handle scenarios where a user cancels the reverification flow, such as closing the modal, which might result in `myData` being `null`.
 *
 * In the following example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/reverification) for more information.
 * If there is an error it will be thrown, and it can be caught and handled according to your app's needs. For example, by displaying a toast notification to the user.
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
 *
 * @example
 * ### Handle `throwOnError: false`
 *
 * When `throwOnError` is set to `false`, the fetcher will not throw an error, but the `error` returned from the `useReverification`.
 * If there is an error it the `error` property will be filled, and it handled according to your app's needs. For example, by displaying a toast notification to the user.
 *
 * In this example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/reverification) for more information.
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
 *    if (isClerkRuntimeError(error) && error.code === 'reverification_cancelled') {
 *      // User has cancelled reverification
 *    }
 *
 *     if (!myData) return
 *   }
 *
 *   return <button onClick={handleClick}>Update User</button>
 * }
 * ```
 */
export const useReverification: UseReverification = (fetcher, options) => {
  const defaultOptions = {
    defaultUI: true,
    throwOnError: true,
    ...options,
  };
  const clerk = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(defaultOptions);
  const { assertReverification, state } = useCreateReverificationHandler({
    openUIComponent: clerk.__internal_openReverification,
    ...optionsRef.current,
  });

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = defaultOptions;
  });

  return {
    action: assertReverification(fetcherRef.current),
    inProgress: state.inProgress,
    level: state.level,
    error: state.error,
    cancel: state.cancel,
    complete: state.cancel,
  };
};
