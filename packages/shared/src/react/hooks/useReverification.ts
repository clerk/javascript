import type { Clerk, SessionVerificationLevel } from '@clerk/types';
import { useEffect, useMemo, useRef, useState } from 'react';

import { validateReverificationConfig } from '../../authorization';
import { isReverificationHint, reverificationError } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '../../error';
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
 * @interface
 */
type UseReverificationOptions = {
  /**
   * A callback function that is invoked when the user cancels the reverification process.
   */
  onCancel?: () => void;
  /**
   * Determines if an error should throw when the user cancels the reverification process. Defaults to `false`.
   */
  throwOnCancel?: boolean;

  /**
   * Determines if the reverification process should be controlled by the consumer. Defaults to `false`.
   */
  controlled?: boolean;
};

/**
 * @interface
 */
type UseReverificationResult<
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
> = readonly [(...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Options>>];

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
  openUIComponent?: Clerk['__internal_openReverification'];
  setReverificationInProgress?: (inProgress: boolean) => void;
  setLevel?: (level: string | undefined) => void;
  setReverificationCancel?: (cancel: () => void) => void;
  setReverificationCompleted?: (completed: () => void) => void;
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

        // /**
        //  * On success resolve the pending promise
        //  * On cancel reject the pending promise
        //  */
        // params.openUIComponent?.({
        //   level: isValidMetadata ? isValidMetadata().level : undefined,
        //   afterVerification() {
        //     resolvers.resolve(true);
        //   },
        //   afterVerificationCancelled() {
        //     resolvers.reject(
        //       new ClerkRuntimeError('User cancelled attempted verification', {
        //         code: 'reverification_cancelled',
        //       }),
        //     );
        //   },
        // });

        params.setLevel?.(isValidMetadata ? isValidMetadata().level : undefined);
        params.setReverificationInProgress?.(true);
        params.setReverificationCompleted?.(() => {
          return () => resolvers.resolve(true);
        });
        params.setReverificationCancel?.(() => {
          return () =>
            resolvers.reject(
              new ClerkRuntimeError('User cancelled attempted verification', {
                code: 'reverification_cancelled',
              }),
            );
        });

        try {
          /**
           * Wait until the promise from above have been resolved or rejected
           */
          await resolvers.promise;
        } catch (e) {
          if (params.onCancel) {
            params.onCancel();
          }

          if (isClerkRuntimeError(e) && e.code === 'reverification_cancelled' && params.throwOnCancel) {
            throw e;
          }

          return null;
        } finally {
          params.setReverificationInProgress?.(true);
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
 *
 * ```tsx {{ filename: 'src/components/MyButton.tsx' }}
 * import { useReverification } from '@clerk/react'
 *
 * export function MyButton() {
 *   const [enhancedFetcher] = useReverification(myFetcher)
 *
 *   const handleClick = async () => {
 *     const myData = await enhancedFetcher()
 *     // If `myData` is null, the user canceled the reverification process
 *     // You can choose how your app responds. This example returns null.
 *     if (!myData) return
 *   }
 *
 *   return <button onClick={handleClick}>Update User</button>
 * }
 * ```
 *
 * @example
 * ### Handle `throwOnCancel`
 *
 * When `throwOnCancel` is set to `true`, the fetcher will throw a `ClerkRuntimeError` with the code `"reverification_cancelled"` if the user cancels the reverification flow (for example, by closing the modal). This error can be caught and handled according to your app's needs. For example, by displaying a toast notification to the user or silently ignoring the cancellation.
 *
 * In this example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/reverification) for more information.
 *
 * ```tsx {{ filename: 'src/components/MyButton.tsx' }}
 * import { useReverification } from '@clerk/clerk-react'
 * import { isClerkRuntimeError } from '@clerk/clerk-react/errors'
 *
 * export function MyButton() {
 *   const [enhancedFetcher] = useReverification(myFetcher, { throwOnCancel: true })
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
export const useReverification: UseReverification = (fetcher, options) => {
  const { __internal_openReverification } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(optionsWithDefaults);
  const [verificationLevel, setVerificationLevel] = useState<string | undefined>(undefined);
  const [isReVerificationInProgress, setIsReVerificationInProgress] = useState<boolean>(false);
  const [reverificationCancel, setReverificationCancel] = useState<() => void>(() => {});
  const [reverificationCompleted, setReverificationCompleted] = useState<() => void>(() => {});

  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      setLevel: setVerificationLevel,
      setReverificationInProgress: setIsReVerificationInProgress,
      setReverificationCancel,
      setReverificationCompleted,
      ...optionsRef.current,
    })(fetcherRef.current);
    return handler;
  }, []);

  // If controlled, open reverification on mount if re-verification is in progress
  useEffect(() => {
    if (!optionsWithDefaults.controlled && isReVerificationInProgress) {
      clerk.__internal_openReverification({
        level: (verificationLevel as SessionVerificationLevel) || undefined,
        afterVerification() {
          reverificationCompleted();
        },
        afterVerificationCancelled() {
          reverificationCancel();
        },
      });
    }
  }, [
    verificationLevel,
    clerk,
    isReVerificationInProgress,
    optionsWithDefaults.controlled,
    reverificationCancel,
    reverificationCompleted,
  ]);

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = optionsWithDefaults;
  });

  return handleReverification;
};
