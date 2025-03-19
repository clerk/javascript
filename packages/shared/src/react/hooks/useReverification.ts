import type { Clerk, SessionVerificationLevel } from '@clerk/types';
import { useMemo, useRef } from 'react';

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

type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;

/**
 * The optional options object.
 * @interface
 */
type UseReverificationOptions = {
  /**
   * A handler that is called when reverification is needed, this will opt-out of using the default UI when provided.
   *
   * @param cancel - A function that will cancel the reverification process.
   * @param complete - A function that will retry the original request after reverification.
   * @param level - The level returned with the reverification hint.
   *
   */
  onNeedsReverification?: (properties: {
    cancel: () => void;
    complete: () => void;
    level: SessionVerificationLevel | undefined;
  }) => void;
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
  fetcher: Fetcher,
  options?: Options,
) => UseReverificationResult<Fetcher>;

type CreateReverificationHandlerParams = UseReverificationOptions & {
  openUIComponent: Clerk['__internal_openReverification'];
};

function createReverificationHandler(params: CreateReverificationHandlerParams) {
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
 * import { useReverification } from '@clerk/clerk-react'
 *
 * export function MyButton() {
 *   const enhancedFetcher = useReverification(myFetcher)
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
 */
export const useReverification: UseReverification = (fetcher, options) => {
  const { __internal_openReverification } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      openUIComponent: __internal_openReverification,
      ...optionsRef.current,
    })(fetcherRef.current);
    return handler;
  }, [__internal_openReverification, fetcherRef.current, optionsRef.current]);

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });

  return handleReverification;
};
