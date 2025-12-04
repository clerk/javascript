import { useCallback, useRef } from 'react';

import { validateReverificationConfig } from '../../authorization';
import { isReverificationHint, reverificationError } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import { eventMethodCalled } from '../../telemetry';
import type { Clerk, SessionVerificationLevel } from '../../types';
import { createDeferredPromise } from '../../utils/createDeferredPromise';
import { useClerk } from './useClerk';
import { useSafeLayoutEffect } from './useSafeLayoutEffect';

const CLERK_API_REVERIFICATION_ERROR_CODE = 'session_reverification_required';

/**
 *
 */
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

type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;

/**
 * @interface
 */
export type NeedsReverificationParameters = {
  /**
   * Marks the reverification process as cancelled and rejects the original request.
   */
  cancel: () => void;
  /**
   * Marks the reverification process as complete and retries the original request.
   */
  complete: () => void;
  /**
   * The verification level required for the reverification process.
   */
  level: SessionVerificationLevel | undefined;
};

/**
 * The optional options object.
 *
 * @interface
 */
export type UseReverificationOptions = {
  /**
   * Handler for the reverification process. Opts out of using the default UI. Use this to build a custom UI.
   *
   * @param properties - Callbacks and info to control the reverification flow.
   * @param properties.cancel - A function that will cancel the reverification process.
   * @param properties.complete - A function that will retry the original request after reverification.
   * @param properties.level - The level returned with the reverification hint.
   */
  onNeedsReverification?: (properties: NeedsReverificationParameters) => void;
};

/**
 * @interface
 */
type UseReverificationResult<Fetcher extends (...args: any[]) => Promise<any> | undefined> = (
  ...args: Parameters<Fetcher>
) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>>;

/**
 * @interface
 */
type UseReverification = <
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions = UseReverificationOptions,
>(
  /**
   * A function that returns a promise.
   */
  fetcher: Fetcher,
  /**
   * Optional configuration object extending [`UseReverificationOptions`](https://clerk.com/docs/reference/hooks/use-reverification#use-reverification-options).
   */
  options?: Options,
) => UseReverificationResult<Fetcher>;

type CreateReverificationHandlerParams = UseReverificationOptions & {
  openUIComponent: Clerk['__internal_openReverification'];
  telemetry: Clerk['telemetry'];
};

/**
 *
 */
function createReverificationHandler(params: CreateReverificationHandlerParams) {
  /**
   *
   */
  function assertReverification<Fetcher extends (...args: any[]) => Promise<any> | undefined>(
    fetcher: Fetcher,
  ): (...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>>> {
    return (async (...args: Parameters<Fetcher>) => {
      let result = await resolveResult(fetcher(...args));

      if (isReverificationHint(result)) {
        /**
         * Create a promise
         */
        const resolvers = createDeferredPromise();

        const isValidMetadata = validateReverificationConfig(result.clerk_error.metadata?.reverification);

        const level = isValidMetadata ? isValidMetadata().level : undefined;

        const cancel = () => {
          resolvers.reject(
            new ClerkRuntimeError('User cancelled attempted verification', {
              code: 'reverification_cancelled',
            }),
          );
        };

        const complete = () => {
          resolvers.resolve(true);
        };

        if (params.onNeedsReverification === undefined) {
          /**
           * On success resolve the pending promise
           * On cancel reject the pending promise
           */
          params.openUIComponent?.({
            level: level,
            afterVerification: complete,
            afterVerificationCancelled: cancel,
          });
        } else {
          params.onNeedsReverification({
            cancel,
            complete,
            level,
          });
        }

        /**
         * Wait until the promise from above have been resolved or rejected
         */
        await resolvers.promise;

        /**
         * After the promise resolved successfully try the original request one more time
         */
        result = await resolveResult(fetcher(...args));
      }

      return result;
    }) as ExcludeClerkError<Awaited<ReturnType<Fetcher>>>;
  }

  return assertReverification;
}

/**
 * > [!WARNING]
 * >
 * > Depending on the SDK you're using, this feature requires `@clerk/nextjs@6.12.7` or later, `@clerk/react@5.25.1` or later, and `@clerk/clerk-js@5.57.1` or later.
 *
 * The `useReverification()` hook is used to handle a session's reverification flow. If a request requires reverification, a modal will display, prompting the user to verify their credentials. Upon successful verification, the original request will automatically retry.
 *
 * @function
 *
 * @returns The `useReverification()` hook returns an array with the "enhanced" fetcher.
 *
 * @example
 * ### Handle cancellation of the reverification process
 *
 * The following example demonstrates how to handle scenarios where a user cancels the reverification flow, such as closing the modal, which might result in `myData` being `null`.
 *
 * In the following example, `myFetcher` would be a function in your backend that fetches data from the route that requires reverification. See the [guide on how to require reverification](https://clerk.com/docs/guides/secure/reverification) for more information.
 *
 * ```tsx {{ filename: 'src/components/MyButton.tsx' }}
 * import { useReverification } from '@clerk/react'
 * import { isReverificationCancelledError } from '@clerk/react/error'
 *
 * type MyData = {
 *   balance: number
 * }
 *
 * export function MyButton() {
 *   const fetchMyData = () => fetch('/api/balance').then(res=> res.json() as Promise<MyData>)
 *   const enhancedFetcher = useReverification(fetchMyData);
 *
 *   const handleClick = async () => {
 *     try {
 *       const myData = await enhancedFetcher()
 *       //     ^ is types as `MyData`
 *     } catch (e) {
 *       // Handle error returned from the fetcher here
 *
 *       // You can also handle cancellation with the following
 *       if (isReverificationCancelledError(err)) {
 *         // Handle the cancellation error here
 *       }
 *     }
 *   }
 *
 *   return <button onClick={handleClick}>Update User</button>
 * }
 * ```
 */
export const useReverification: UseReverification = (fetcher, options) => {
  const { __internal_openReverification, telemetry } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  telemetry?.record(
    eventMethodCalled('useReverification', {
      onNeedsReverification: Boolean(options?.onNeedsReverification),
    }),
  );

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });

  return useCallback(
    (...args) => {
      const handler = createReverificationHandler({
        openUIComponent: __internal_openReverification,
        telemetry,
        ...optionsRef.current,
      })(fetcherRef.current);
      return handler(...args);
    },
    [__internal_openReverification, telemetry],
  );
};
