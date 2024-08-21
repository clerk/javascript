import { isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { Clerk } from '@clerk/types';
import { useState } from 'react';

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

function resolveResult(result: Promise<unknown>) {
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
  onOpenModal?: Clerk['openUserVerification'];
}) {
  async function assertAssurance<T extends AssuredState<unknown>>(
    fetcher: () => Promise<T>,
  ): Promise<DeAssuredState<T>> {
    let result = await resolveResult(fetcher());

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
        console.log('mounting');
        assurance.onOpenModal?.({
          afterVerification() {
            resolvers.resolve(true);
          },
        });
        console.log('waiting');
        await resolvers.promise;
        console.log('done');
      }

      console.log('run this again');
      result = (await resolveResult(fetcher())) as T;
    }

    return result as DeAssuredState<T>;
  }

  return assertAssurance;
}

// const useAssurance = () => {
//   return useContext(AssuranceContext);
// };
//
// const AssuranceContext = createContext<{
//   handleAssurance: ReturnType<typeof createAssuranceHandler>;
//   resume: (() => void) | undefined;
//   cancel: (() => void) | undefined;
//   isPending: boolean;
// }>({
//   handleAssurance: createAssuranceHandler(),
//   resume: undefined,
//   cancel: undefined,
//   isPending: false,
// });
//
// function AssuranceProvider(props: PropsWithChildren) {
//   const [promiseRes, setPromiseRes] = useState<PromiseWithResolvers<unknown>['resolve'] | undefined>(undefined);
//   const [promiseRej, setPromiseRej] = useState<PromiseWithResolvers<unknown>['reject'] | undefined>(undefined);
//
//   return (
//     <AssuranceContext.Provider
//       value={{
//         handleAssurance: createAssuranceHandler({
//           onPendingVerification(res, rej) {
//             setPromiseRes(() => res);
//             setPromiseRej(() => rej);
//           },
//           onResume() {
//             setPromiseRej(undefined);
//             setPromiseRes(undefined);
//           },
//           onCancel() {
//             setPromiseRej(undefined);
//             setPromiseRes(undefined);
//           },
//         }),
//         resume: promiseRes ? () => promiseRes?.(true) : undefined,
//         cancel: promiseRej ? () => promiseRej?.() : undefined,
//         isPending: !!promiseRes,
//       }}
//     >
//       {props.children}
//     </AssuranceContext.Provider>
//   );
// }

// export { useAssurance, AssuranceProvider };

const useAssurance = <T,>(
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
  const { openUserVerification } = useClerk();
  const [promiseRes, setPromiseRes] = useState<PromiseWithResolvers<unknown>['resolve'] | undefined>(undefined);
  const [promiseRej, setPromiseRej] = useState<PromiseWithResolvers<unknown>['reject'] | undefined>(undefined);

  if ((params as any)?.mode !== 'custom') {
    // @ts-ignore
    return {
      handleAssurance: createAssuranceHandler({
        onOpenModal: openUserVerification,
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
