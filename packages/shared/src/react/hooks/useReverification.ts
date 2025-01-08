import type { Clerk } from '@clerk/types';
import { useMemo, useRef } from 'react';

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

type UseReverificationOptions = {
  onCancel?: () => void;
  throwOnCancel?: boolean;
};

type CreateReverificationHandlerParams = UseReverificationOptions & {
  openUIComponent: Clerk['__internal_openReverification'];
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
> = readonly [(...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Options>>];

/**
 * Receives a fetcher async function and returned an enhanced fetcher that automatically handles the reverification flow
 * by displaying a prebuilt UI component when the request from the fetcher fails with a reverification error response.
 *
 * While the UI component is displayed the promise is still pending.
 * On success: the original request is retried one more time.
 * On error:
 * (1) by default the fetcher will return `null` and the `onCancel` callback will be executed.
 * (2) when `throwOnCancel: true` instead of returning null, the returned fetcher will throw a `ClerkRuntimeError`.
 *
 * @example
 * A simple example:
 *
 * function Hello() {
 *   const [fetchBalance] = useReverification(()=> fetch('/transfer-balance',{method:"POST"}));
 *   return <button onClick={fetchBalance}>...</button>
 * }
 */
function useReverification<
  Fetcher extends (...args: any[]) => Promise<any> | undefined,
  Options extends UseReverificationOptions,
>(fetcher: Fetcher, options?: Options): UseReverificationResult<Fetcher, Options> {
  const { __internal_openReverification } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      openUIComponent: __internal_openReverification,
      ...optionsRef.current,
    })(fetcherRef.current);
    return [handler] as const;
  }, [__internal_openReverification, fetcherRef.current, optionsRef.current]);

  // Keep fetcher and options ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
    optionsRef.current = options;
  });

  return handleReverification;
}

export { useReverification };
