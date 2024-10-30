import { createDeferredPromise } from '@clerk/shared';
import { isReverificationHint, reverificationMismatch } from '@clerk/shared/authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { Clerk } from '@clerk/types';
import { useMemo } from 'react';

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

// Utility type to exclude anything that contains "clerk_error"
type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;

function createReverificationHandler(params: { onOpenModal: Clerk['__experimental_openUserVerification'] }) {
  function assertReverification<H extends (...args: Parameters<H>) => Promise<any>>(
    fetcher: H,
  ): (...args: Parameters<H>) => Promise<ExcludeClerkError<Awaited<ReturnType<H>>>> {
    return async (...args: Parameters<H>) => {
      let result = await resolveResult(fetcher(...args));

      try {
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
              console.log('useReverification', 'afterVerification');
              resolvers.resolve(true);
            },
            afterVerificationCancelled() {
              resolvers.reject(
                new ClerkRuntimeError('User cancelled attempted verification', {
                  code: 'assurance_cancelled',
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
      } catch (e) {
        if (!isClerkRuntimeError(e)) {
          throw e;
        }
      }

      return result as ExcludeClerkError<Awaited<ReturnType<H>>>;
    };
  }

  return assertReverification;
}

const __experimental_useReverification = (): {
  handleReverification: ReturnType<typeof createReverificationHandler>;
} => {
  const { __experimental_openUserVerification } = useClerk();
  const handleReverification = useMemo(
    () =>
      createReverificationHandler({
        onOpenModal: __experimental_openUserVerification,
      }),
    [__experimental_openUserVerification],
  );
  return {
    handleReverification,
  };
};

export { __experimental_useReverification };
