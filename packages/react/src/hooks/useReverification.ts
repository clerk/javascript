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

// type AssuranceHint = {
//   // clerk_error: {
//   //   type: 'forbidden';
//   //   reason: 'assurance';
//   // };
//   clerk_error: {
//     type: 'forbidden';
//     reason: 'assurance';
//     metadata: {
//       level: __experimental_SessionVerificationLevel;
//       maxAge: __experimental_SessionVerificationMaxAgeMinutes;
//     };
//   };
// };

// function generateAssuranceHint<Metadata extends Record<string, string>>(metadata?: Metadata): AssuranceHint;
// function generateAssuranceHint<Metadata extends Record<string, string>>(metadata: Metadata, as: 'response'): Response;
// function generateAssuranceHint<Metadata extends Record<string, string>>(
//   metadata?: Metadata,
//   as?: 'response',
// ): AssuranceHint | Response {
//   //@ts-ignore
//   const obj = {
//     clerk_error: {
//       type: 'forbidden',
//       reason: 'assurance',
//       metadata,
//     },
//   } as AssuranceHint;
//
//   if (as === 'response') {
//     return new Response(JSON.stringify(obj), { status: 403 });
//   }
//
//   return obj;
// }

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

type RemovePropertyIfExists<T, K extends keyof any> = K extends keyof T ? Omit<T, K> : T;
// type ExcludeClerkError<T> = T extends { clerk_error: any } ? never : T;
type ExcludeClerkError<T> = Prettify<RemovePropertyIfExists<T, 'clerk_error'>>;

// Applying the utility to type B
type WithoutClerkError<T> = ExcludeClerkError<T>;

// type WithoutAssuranceHint<T> = Exclude<T, AssuranceHint>;

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

// <H extends (...args: InferParameters<H>) => InferReturnType<H>>(handler: H) =>
//   (...args: InferParameters<H>): InferReturnType<H> => {

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

function createAssuranceHandler(params: { onOpenModal: Clerk['__experimental_openUserVerification'] }) {
  // function assertAssurance<T, Args>(fetcher: (...args: Args[]) => Promise<T>): (...args: Args[]) => Promise<T> {
  // function assertAssurance<H extends (...args: InferParameters<H>) => Promise<InferReturnType<H>>>(fetcher: H): H {
  function assertAssurance<H extends (...args: InferParameters<H>) => InferReturnType<H>>(
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

  return assertAssurance;
}

const __experimental_useReverification = (): {
  handleReverification: ReturnType<typeof createAssuranceHandler>;
} => {
  const { __experimental_openUserVerification } = useClerk();
  const handleReverification = useMemo(
    () =>
      createAssuranceHandler({
        onOpenModal: __experimental_openUserVerification,
      }),
    [__experimental_openUserVerification],
  );
  return {
    handleReverification,
  };
};

export { __experimental_useReverification };
