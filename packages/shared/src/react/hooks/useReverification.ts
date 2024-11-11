import type { Clerk } from '@clerk/types';
import { useMemo, useRef } from 'react';

import { isReverificationHint, reverificationMismatch } from '../../authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError } from '../../error';
import { createDeferredPromise } from '../../utils/createDeferredPromise';
import { useClerk } from './useClerk';
import { useSafeLayoutEffect } from './useSafeLayoutEffect';

async function resolveResult<T>(result: Promise<T>): Promise<T | ReturnType<typeof reverificationMismatch>> {
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
        return reverificationMismatch();
      }

      // rethrow
      throw e;
    });
}

function createReverificationHandler(params: { onOpenModal: Clerk['__internal_openUserVerification'] }) {
  function assertReverification<Fetcher extends () => Promise<any>>(fetcher: Fetcher): Fetcher {
    return (async (...args) => {
      let result = await resolveResult(fetcher(...args));

      if (isReverificationHint(result)) {
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
    }) as Fetcher;
  }

  return assertReverification;
}

function __experimental_useReverification<Fetcher extends () => Promise<any>>(fetcher: Fetcher): readonly [Fetcher] {
  const { __internal_openUserVerification } = useClerk();
  const fetcherRef = useRef(fetcher);

  const handleReverification = useMemo(() => {
    const handler = createReverificationHandler({
      onOpenModal: __internal_openUserVerification,
    })(fetcherRef.current);
    return [handler] as const;
  }, [__internal_openUserVerification, fetcherRef.current]);

  // Keep fetcher ref in sync
  useSafeLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  return handleReverification;
}

export { __experimental_useReverification };
