import { reverificationMismatch } from '@clerk/shared/authorization-errors';
import { ClerkRuntimeError, isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { __experimental_ReverificationConfig, Clerk } from '@clerk/types';
import { useMemo } from 'react';

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

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
        return reverificationMismatch({} as __experimental_ReverificationConfig);
      }

      // rethrow
      throw e;
    });
}

/**
 * Polyfill for Promise.withResolvers()
 */
function customPromiseWithResolves() {
  let resolve: PromiseWithResolvers<unknown>['resolve'];
  let reject: PromiseWithResolvers<unknown>['reject'];

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    // @ts-ignore
    resolve,
    // @ts-ignore
    reject,
  };
}

// Utility type to exclude anything that contains "clerk_error"
type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;

const isReverificationHint = (result: any): result is ReturnType<typeof reverificationMismatch> => {
  return (
    result &&
    typeof result === 'object' &&
    'clerk_error' in result &&
    result.clerk_error?.type === 'forbidden' &&
    result.clerk_error?.reason === 'reverification-mismatch'
  );
};

type InferParameters<T> = T extends (...args: infer P) => any ? P : never;
type InferReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function createReverificationHandler(params: { onOpenModal: Clerk['__experimental_openUserVerification'] }) {
  function assertReverification<H extends (...args: InferParameters<H>) => InferReturnType<H>>(
    fetcher: H,
  ): (...args: InferParameters<H>) => Promise<ExcludeClerkError<Awaited<InferReturnType<H>>>> {
    // @ts-ignore
    const f = async (...args) => {
      // @ts-ignore
      let result = await resolveResult(fetcher(...args));

      try {
        if (isReverificationHint(result)) {
          /**
           * Create a promise
           */
          const resolvers = customPromiseWithResolves();

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
          // @ts-ignore
          result = await resolveResult(fetcher(...args));
        }
      } catch (e) {
        if (!isClerkRuntimeError(e)) {
          throw e;
        }
      }

      return result as InferReturnType<H>;
    };

    // @ts-ignore
    return f;
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
