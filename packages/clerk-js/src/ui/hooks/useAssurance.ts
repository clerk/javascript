import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { Clerk } from '@clerk/types';
import { useMemo } from 'react';

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

type AssuranceHint = {
  clerk_error: {
    type: 'forbidden';
    reason: 'assurance';
  };
};

function generateAssuranceHint<Metadata extends Record<string, string>>(metadata?: Metadata): AssuranceHint;
function generateAssuranceHint<Metadata extends Record<string, string>>(metadata: Metadata, as: 'response'): Response;
function generateAssuranceHint<Metadata extends Record<string, string>>(
  metadata?: Metadata,
  as?: 'response',
): AssuranceHint | Response {
  const obj = {
    clerk_error: {
      type: 'forbidden',
      reason: 'assurance',
      metadata,
    },
  } as AssuranceHint;

  if (as === 'response') {
    return new Response(JSON.stringify(obj), { status: 403 });
  }

  return obj;
}

async function resolveResult<T>(result: Promise<T>): Promise<T | AssuranceHint> {
  return result.catch(e => {
    // Treat fapi assurance as an assurance hint
    if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code == 'session_step_up_verification_required')) {
      return generateAssuranceHint();
    }

    // rethrow
    throw e;
  });
}

/**
 * Polyfill for Promise.withResolvers()
 */
function customPromiseWithResolvers() {
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

type WithoutAssuranceHint<T> = Exclude<T, AssuranceHint>;

const isAssuranceHint = (result: any): result is AssuranceHint => {
  return (
    result &&
    typeof result === 'object' &&
    'clerk_error' in result &&
    result.clerk_error?.type === 'forbidden' &&
    result.clerk_error?.reason === 'assurance'
  );
};

function createAssuranceHandler(params: { onOpenModal: Clerk['__experimental_openUserVerification'] }) {
  async function assertAssurance<T>(fetcher: () => Promise<T>): Promise<T> {
    let result = await resolveResult(fetcher());

    if (isAssuranceHint(result)) {
      /**
       * Create a promise
       */
      const resolvers = customPromiseWithResolvers();

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
      result = await resolveResult(fetcher());
    }

    return result as WithoutAssuranceHint<T>;
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
