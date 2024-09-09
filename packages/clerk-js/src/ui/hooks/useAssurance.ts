import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { Clerk } from '@clerk/types';
import { useState } from 'react';

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

function createAssuranceHandler(assurance: {
  onPendingVerification?: (
    res: PromiseWithResolvers<unknown>['resolve'],
    rej: PromiseWithResolvers<unknown>['reject'],
  ) => void;
  onResume?: () => void;
  onCancel?: () => void;
  onOpenModal?: Clerk['__experimental_openUserVerification'];
}) {
  async function assertAssurance<T extends AssuredState<unknown>>(
    fetcher: () => Promise<T>,
  ): Promise<DeAssuredState<T>> {
    let result = ((await resolveResult(fetcher())) || {}) as T;

    //@ts-ignore
    if ('clerk_error' in result && 'reason' in result) {
      const resolvers = customPromiseWithResolves();

      if (assurance?.onPendingVerification) {
        assurance.onPendingVerification(resolvers.resolve, resolvers.reject);
        try {
          await resolvers.promise;
          assurance.onResume?.();
        } catch {
          assurance.onCancel?.();
        }
      } else {
        assurance.onOpenModal?.({
          afterVerification() {
            resolvers.resolve(true);
          },
          onVerificationCancel() {
            resolvers.reject(
              new ClerkRuntimeError('User cancelled attempted verification', {
                code: 'assurance_cancelled',
              }),
            );
          },
        });
        await resolvers.promise;
      }

      result = (await resolveResult(fetcher())) as T;
    }

    return result as DeAssuredState<T>;
  }

  return assertAssurance;
}

const useAssurance = <T>(
  params?: T,
): T extends { mode: 'custom' }
  ? {
      handleAssurance: ReturnType<typeof createAssuranceHandler>;
      resume: (() => void) | undefined;
      cancel: (() => void) | undefined;
      isPending: boolean;
    }
  : {
      handleAssurance: ReturnType<typeof createAssuranceHandler>;
    } => {
  const { __experimental_openUserVerification } = useClerk();
  const [promiseRes, setPromiseRes] = useState<PromiseWithResolvers<unknown>['resolve'] | undefined>(undefined);
  const [promiseRej, setPromiseRej] = useState<PromiseWithResolvers<unknown>['reject'] | undefined>(undefined);

  if ((params as any)?.mode !== 'custom') {
    // @ts-ignore
    return {
      handleAssurance: createAssuranceHandler({
        onOpenModal: __experimental_openUserVerification,
      }),
    };
  }

  // @ts-ignore
  return {
    handleAssurance: createAssuranceHandler({
      onPendingVerification(res, rej) {
        setPromiseRes(() => res);
        setPromiseRej(() => rej);
      },
      onResume() {
        setPromiseRej(undefined);
        setPromiseRes(undefined);
      },
      onCancel() {
        setPromiseRej(undefined);
        setPromiseRes(undefined);
      },
    }),
    resume: promiseRes ? () => promiseRes?.(true) : undefined,
    cancel: promiseRej ? () => promiseRej?.() : undefined,
    isPending: !!promiseRes,
  };
};

export { useAssurance };
