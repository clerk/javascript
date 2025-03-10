import type { Clerk, SessionVerificationLevel } from '@clerk/types';
import { useMemo, useRef, useState } from 'react';

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

type CreateReverificationHandlerParams = UseReverificationOptions & {
  openUIComponent: Clerk['__internal_openReverification'];
  level: [
    SessionVerificationLevel | undefined,
    React.Dispatch<React.SetStateAction<SessionVerificationLevel | undefined>>,
  ];
  error: [Error | undefined, React.Dispatch<React.SetStateAction<Error | undefined>>];
  inProgress: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  cancel: [() => void, React.Dispatch<React.SetStateAction<() => void>>];
  complete: [() => void, React.Dispatch<React.SetStateAction<() => void>>];
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

        const [, setLevel] = params.level;
        const [, setError] = params.error;
        const [, setInProgress] = params.inProgress;
        const [cancel, setCancel] = params.cancel;
        const [complete, setComplete] = params.complete;

        setLevel(isValidMetadata ? isValidMetadata().level : undefined);
        setError(undefined);
        setInProgress(true);
        setCancel(() => {
          return () => {
            resolvers.reject(
              new ClerkRuntimeError('User cancelled attempted verification', {
                code: 'reverification_cancelled',
              }),
            );

            setInProgress(false);
          };
        });
        setComplete(() => {
          return () => {
            resolvers.resolve(true);
            setInProgress(false);
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
              complete();
            },
            afterVerificationCancelled() {
              cancel();
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

  return assertReverification;
}

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
  level: string | undefined;

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
    defaultUI: true,
    throwOnError: true,
    ...options,
  };
  const clerk = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(defaultOptions);
  const [level, setLevel] = useState<SessionVerificationLevel | undefined>(undefined);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [complete, setComplete] = useState<() => void>(() => {});
  const [cancel, setCancel] = useState<() => void>(() => {});

  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      openUIComponent: clerk.__internal_openReverification,
      level: [level, setLevel],
      cancel: [cancel, setCancel],
      complete: [complete, setComplete],
      error: [error, setError],
      inProgress: [inProgress, setInProgress],
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
    inProgress,
    level,
    cancel,
    complete,
    error,
  };
}

export { useReverification };
