import type { Clerk } from '@clerk/types';
import { useMemo, useRef } from 'react';

import { __experimental_isReverificationHint, __experimental_reverificationMismatch } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '../../error';
import { createDeferredPromise } from '../../utils/createDeferredPromise';
import { useClerk } from './useClerk';
import { useSafeLayoutEffect } from './useSafeLayoutEffect';

async function resolveResult<T>(
  result: Promise<T>,
): Promise<T | ReturnType<typeof __experimental_reverificationMismatch>> {
  return result
    .then(r => {
      if (r instanceof Response) {
        return r.json();
      }
      return r;
    })
    .catch(e => {
      // Treat fapi assurance as an assurance hint
      if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code == 'session_step_up_verification_required')) {
        return __experimental_reverificationMismatch();
      }

      // rethrow
      throw e;
    });
}

type ExcludeClerkError<T, P> = T extends { clerk_error: any } ? (P extends { throwOnCancel: true } ? never : null) : T;

type UseReverificationOptions = {
  onCancel?: () => void;
  throwOnCancel?: boolean;
};

function createReverificationHandler(
  params: { onOpenModal: Clerk['__experimental_openUserVerification'] } & UseReverificationOptions,
) {
  function assertReverification<Fetcher extends (...args: any[]) => Promise<any>>(
    fetcher: Fetcher,
  ): (
    ...args: Parameters<Fetcher>
  ) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, Parameters<Fetcher>[1]>> {
    return (async (...args) => {
      let result = await resolveResult(fetcher(...args));

      if (__experimental_isReverificationHint(result)) {
        /**
         * Create a promise
         */
        const resolvers = createDeferredPromise();

        /**
         * On success resolve the pending promise
         * On cancel reject the pending promise
         */
        params.onOpenModal?.({
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
    }) as Fetcher;
  }

  return assertReverification;
}

function __experimental_useReverification<
  Fetcher extends (...args: any[]) => Promise<any>,
  O extends UseReverificationOptions,
>(
  fetcher: Fetcher,
  options?: O,
): readonly [(...args: Parameters<Fetcher>) => Promise<ExcludeClerkError<Awaited<ReturnType<Fetcher>>, O>>] {
  const { __experimental_openUserVerification } = useClerk();
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(options);

  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      onOpenModal: __experimental_openUserVerification,
      onCancel: optionsRef.current?.onCancel,
    })(fetcherRef.current);
    return [handler] as const;
  }, [__experimental_openUserVerification, fetcherRef.current, optionsRef.current]);

  // Keep fetcher ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  return handleReverification;
}

export { __experimental_useReverification };
