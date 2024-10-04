import type { PPermissionMismatchError, RReverificationMismatchError } from '@clerk/shared/authorization-errors';
import {
  permissionMismatch,
  reverificationMismatch,
  roleMismatch,
  signedOut,
} from '@clerk/shared/authorization-errors';
import type { __internal_ProtectConfiguration } from '@clerk/shared/protect';
import { __internal_findFailedProtectConfiguration } from '@clerk/shared/protect';
import type {
  __experimental_SessionVerificationLevel,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

import { auth } from '../app-router/server/auth';

type MyAuth = ReturnType<typeof auth>;

type InferParametersFromSecond<T> = T extends (auth: any, ...args: infer P) => any ? P : never;

type InferReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type InferStrictTypeParams<T extends WithProtectActionParams | undefined> = T;

type NonNullable<T> = T extends null | undefined ? never : T;
type NonNullableRecord<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

type WithProtectActionParams =
  | {
      role: OrganizationCustomRoleKey;
      permission?: never;
      reverification?: never;
    }
  | {
      role?: never;
      permission: OrganizationCustomPermissionKey;
      reverification?: never;
    }
  | {
      role?: never;
      permission?: never;
      reverification:
        | 'veryStrict'
        | 'strict'
        | 'moderate'
        | 'lax'
        | {
            level: __experimental_SessionVerificationLevel;
            afterMinutes: number;
          };
    };

type CustomAuthObject<T extends WithProtectActionParams> =
  InferStrictTypeParams<T> extends
    | { permission: any }
    | {
        role: any;
      }
    ? NonNullableRecord<MyAuth, 'orgId' | 'userId' | 'sessionId' | 'orgRole' | 'orgPermissions'>
    : NonNullableRecord<MyAuth, 'userId'>;

// function __experimental_protectAction() {
//   // We will accumulate permissions here
//   const configs: __internal_ProtectConfiguration[] = [{}];
//
//   const withNext = <T extends WithProtectActionParams>(nextParams: T) => {
//     configs.push(nextParams);
//
//     // Maybe this should return the correct types instead of hiding them
//     const action =
//       <H extends (_auth: CustomAuthObject<T>, ...args: InferParametersFromSecond<H>) => InferReturnType<H>>(
//         handler: H,
//       ) =>
//       (
//         ...args: InferParametersFromSecond<H>
//       ):
//         | Promise<Awaited<InferReturnType<H>>>
//         | Promise<
//             InferStrictTypeParams<T> extends { reverification: any }
//               ? ReturnType<typeof reverificationMismatch<T['reverification']>>
//               : InferStrictTypeParams<T> extends
//                     | { permission: any }
//                     | {
//                         role: any;
//                       }
//                 ? InferStrictTypeParams<T> extends {
//                     permission: any;
//                   }
//                   ? ReturnType<typeof permissionMismatch<T['permission']>>
//                   : ReturnType<typeof roleMismatch<T['role']>>
//                 : ReturnType<typeof signedOut>
//           > => {
//         const _auth = auth();
//         const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);
//
//         if (failedItem?.reverification) {
//           //@ts-expect-error
//           return reverificationMismatch(failedItem.reverification);
//         }
//
//         if (failedItem?.role) {
//           //@ts-expect-error
//           return roleMismatch(failedItem.role);
//         }
//
//         if (failedItem?.permission) {
//           //@ts-expect-error
//           return permissionMismatch(failedItem.permission);
//         }
//
//         if (failedItem) {
//           // @ts-expect-error
//           return signedOut();
//         }
//
//         // @ts-ignore not sure why ts complains TODO-STEP-UP
//         return handler(auth(), ...args);
//       };
//     return { with: withNext<WithProtectActionParams>, action };
//   };
//
//   const action =
//     <
//       H extends (
//         _auth: NonNullableRecord<MyAuth, 'userId'>,
//         ...args: InferParametersFromSecond<H>
//       ) => InferReturnType<H>,
//     >(
//       handler: H,
//     ) =>
//     (
//       ...args: InferParametersFromSecond<H>
//     ): Promise<Awaited<InferReturnType<H>>> | Promise<ReturnType<typeof signedOut>> => {
//       const _auth = auth();
//       const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);
//
//       if (failedItem) {
//         // @ts-expect-error
//         return signedOut();
//       }
//       // @ts-ignore not sure why ts complains TODO-STEP-UP
//       return handler(auth(), ...args);
//     };
//
//   return { with: withNext, action };
// }

type Merge<T, U> = T & U extends infer O ? { [K in keyof O]: O[K] } : never;

// Utility type to check if "reverification" is already set in T
type HasReverification<T> = T extends { reverification: any } ? true : false;

// Chainable type that keeps track of whether reverification has been set
// @ts-ignore
type Chainable<T = {}> =
  HasReverification<T> extends true
    ? {
        // @ts-ignore
        action<H extends (_auth: CustomAuthObject<T>, ...args: InferParametersFromSecond<H>) => InferReturnType<H>>(
          handler: H,
        ): (
          ...args: InferParametersFromSecond<H>
        ) => InferReturnType<H> &
          (T extends { reverification: any; permission: any; role: any }
            ?
                | ReturnType<typeof reverificationMismatch<T['reverification']>>
                | ReturnType<typeof permissionMismatch<T['permission']>>
                | ReturnType<typeof roleMismatch<T['role']>>
                | ReturnType<typeof signedOut>
            : T extends { reverification: any; permission: any }
              ?
                  | RReverificationMismatchError<T['reverification']>
                  | PPermissionMismatchError<T['permission']>
                  | ReturnType<typeof signedOut>
              : T extends { reverification: any; role: any }
                ?
                    | ReturnType<typeof reverificationMismatch<T['reverification']>>
                    | ReturnType<typeof roleMismatch<T['role']>>
                    | ReturnType<typeof signedOut>
                : T extends { permission: any; role: any }
                  ?
                      | ReturnType<typeof permissionMismatch<T['permission']>>
                      | ReturnType<typeof roleMismatch<T['role']>>
                      | ReturnType<typeof signedOut>
                  : T extends { permission: any }
                    ? ReturnType<typeof permissionMismatch<T['permission']>> | ReturnType<typeof signedOut>
                    : T extends { role: any }
                      ? ReturnType<typeof roleMismatch<T['role']>> | ReturnType<typeof signedOut>
                      : T extends { reverification: any }
                        ? ReturnType<typeof reverificationMismatch<T['reverification']>> | ReturnType<typeof signedOut>
                        : ReturnType<typeof signedOut>);
      }
    : {
        with<K extends WithProtectActionParams>(key: K): Chainable<Merge<T, K>>;
        // @ts-ignore
        action<H extends (_auth: CustomAuthObject<T>, ...args: InferParametersFromSecond<H>) => InferReturnType<H>>(
          handler: H,
        ): (
          ...args: InferParametersFromSecond<H>
        ) => InferReturnType<H> &
          (T extends { reverification: any; permission: any; role: any }
            ?
                | ReturnType<typeof reverificationMismatch<T['reverification']>>
                | ReturnType<typeof permissionMismatch<T['permission']>>
                | ReturnType<typeof roleMismatch<T['role']>>
                | ReturnType<typeof signedOut>
            : T extends { reverification: any; permission: any }
              ?
                  | ReturnType<typeof reverificationMismatch<T['reverification']>>
                  | ReturnType<typeof permissionMismatch<T['permission']>>
                  | ReturnType<typeof signedOut>
              : T extends { reverification: any; role: any }
                ?
                    | ReturnType<typeof reverificationMismatch<T['reverification']>>
                    | ReturnType<typeof roleMismatch<T['role']>>
                    | ReturnType<typeof signedOut>
                : T extends { permission: any; role: any }
                  ?
                      | ReturnType<typeof permissionMismatch<T['permission']>>
                      | ReturnType<typeof roleMismatch<T['role']>>
                      | ReturnType<typeof signedOut>
                  : T extends { permission: any }
                    ? ReturnType<typeof permissionMismatch<T['permission']>> | ReturnType<typeof signedOut>
                    : T extends { role: any }
                      ? ReturnType<typeof roleMismatch<T['role']>> | ReturnType<typeof signedOut>
                      : T extends { reverification: any }
                        ? ReturnType<typeof reverificationMismatch<T['reverification']>> | ReturnType<typeof signedOut>
                        : ReturnType<typeof signedOut>);
      };

// type ChainableCreator<T extends {} = {}> = (p: T) => Chainable<T>;

// Updated 'config' as a function that returns a Chainable instance
// const __experimental_protectAction = (): Chainable => {
//   const chainable: Chainable = {
//     with(key) {
//       // Return a new Chainable instance with the updated state
//       return this;
//     },
//     action() {
//       // This would return the accumulated options in a real implementation
//       return {} as any;
//     },
//   };
//   return chainable;
// };

function __experimental_protectAction() {
  const configs: __internal_ProtectConfiguration[] = [{}];
  const createBuilder = <A extends {}>(config: A): Chainable => {
    // We will accumulate permissions here
    return {
      // @ts-expect-error
      with(p) {
        configs.push(p);
        return createBuilder({ ...p, ...config });
      },
      // @ts-expect-error
      action(handler) {
        return (...args) => {
          const _auth = auth();
          const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

          if (failedItem?.reverification) {
            return reverificationMismatch(failedItem.reverification);
          }

          if (failedItem?.role) {
            return roleMismatch(failedItem.role);
          }

          if (failedItem?.permission) {
            return permissionMismatch(failedItem.permission);
          }

          if (failedItem) {
            return signedOut();
          }

          return handler(
            // @ts-expect-error Slight inconsistency in types
            auth(),
            // @ts-expect-error Slight inconsistency in types
            ...args,
          );
        };
      },
    };
  };

  return createBuilder({});

  // function createBuilder<T = {}>(params: T) {
  //   return {
  //     with<P extends WithProtectActionParams>(newParams: P) {
  //       return createBuilder<T & P>({...params, ...newParams});
  //     },
  //     action<
  //       H extends (
  //         _auth: NonNullableRecord<MyAuth, 'userId'>,
  //         ...args: InferParametersFromSecond<H>
  //       ) => InferReturnType<H>,
  //     >(
  //       handler: H,
  //     ): (...args: InferParametersFromSecond<H>) => Promise<
  //       Awaited<InferReturnType<H>> & (T extends { reverification: any }
  //       ? ReturnType<typeof reverificationMismatch<'moderate'>>
  //       : T extends | { permission: any }
  //         | {
  //         role: any;
  //       }
  //         ? T extends {
  //             permission: any;
  //           }
  //           ? ReturnType<typeof permissionMismatch<T['permission']>> & ReturnType<typeof roleMismatch<T['role']>>
  //           : ReturnType<typeof roleMismatch<T['role']>>
  //         : ReturnType<typeof signedOut>)
  //     > {
  //       const _auth = auth();
  //       const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);
  //
  //       if (failedItem) {
  //         // @ts-expect-error
  //         return signedOut();
  //       }
  //       // @ts-ignore not sure why ts complains TODO-STEP-UP
  //       return handler(auth(), ...args);
  //     },
  //   };
  // }
  //
  // return createBuilder({});
}

// const a: Prettify<PPermissionMismatchError<'dwadadaw'> | RReverificationMismatchError<'strict'>>;
//
// const b: Prettify<PPermissionMismatchError<'dwadwa'> | RReverificationMismatchError<'dwada'>>;
//
// const c: Prettify<ReturnType<typeof permissionMismatch<'dwadwa'>> | ReturnType<typeof reverificationMismatch<'strict'>>>
//
// if(c.clerk_error.reason === 'permission-mismatch') {
//   c.clerk_error.metadata.permission
// }

// const wlwda = __experimental_protectAction()
//   .with({
//     role: 'admin'
//   })
//   .with({
//     permission: 'dwada',
//   })
//   .with({
//     permission: 'dwaddwadawa',
//   })
//   // .with({
//   //   role: 'dwa',
//   // })
//   .with({
//     reverification: 'lax',
//   })
//   .action((auth, lole: string) => {
//     const apa = (auth.orgId)
//     console.log(apa, lole)
//     return {
//       pantelis: 'elef',
//     };
//   });
//
// type Prettify<T> = {
//   [K in keyof T]: T[K];
// } & {};

// const dwada: Prettify<ReturnType<typeof wlwda>>
//
// if ('clerk_error' in dwada) {
//   if (dwada.clerk_error.reason === 'permission-mismatch') {
//     dwada.clerk_error.metadata.permission === 'sdwa'
//   }
// } else {
//   dwada.
// }
export { __experimental_protectAction };
