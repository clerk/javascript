import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { Clerk } from '@clerk/types';
import { useMemo } from 'react';

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

async function resolveResult(result: Promise<unknown>) {
  return result
    .then(r => {
      if (r instanceof Response) {
        return r.json();
      }
      return r;
    })
    .catch(e => {
      if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code == 'session_step_up_verification_required')) {
        return { clerk_error: 'forbidden', reason: 'assurance' };
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

type AssuredState<T> =
  | T
  | {
      clerk_error: 'forbidden';
      reason: 'assurance';
    };

type DeAssuredState<T> = Exclude<
  T,
  {
    clerk_error: 'forbidden';
    reason: 'assurance';
  }
>;

function createAssuranceHandler(params: { onOpenModal: Clerk['__experimental_openUserVerification'] }) {
  async function assertAssurance<T extends AssuredState<unknown>>(
    fetcher: () => Promise<T>,
  ): Promise<DeAssuredState<T>> {
    let result = ((await resolveResult(fetcher())) || {}) as T;

    //@ts-ignore
    if ('clerk_error' in result && 'reason' in result) {
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
      result = (await resolveResult(fetcher())) as T;
    }

    return result as DeAssuredState<T>;
  }

  return assertAssurance;
}

const useAssurance = (): {
  handleAssurance: ReturnType<typeof createAssuranceHandler>;
} => {
  const { __experimental_openUserVerification } = useClerk();
  const handleAssurance = useMemo(
    () =>
      createAssuranceHandler({
        onOpenModal: __experimental_openUserVerification,
      }),
    [__experimental_openUserVerification],
  );
  return {
    handleAssurance,
  };
};

export { useAssurance };
