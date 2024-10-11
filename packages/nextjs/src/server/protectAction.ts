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
    : NonNullableRecord<MyAuth, 'userId' | 'sessionId'>;

type Merge<T, U> = T & U extends infer O ? { [K in keyof O]: O[K] } : never;

// Utility type to check if "reverification" is already set in T
type HasReverification<T> = T extends { reverification: any } ? true : false;

// Chainable type that keeps track of whether reverification has been set
// @ts-ignore
type Chainable<T = object> =
  HasReverification<T> extends true
    ? {
        // @ts-ignore
        action<H extends (_auth: CustomAuthObject<T>, ...args: InferParametersFromSecond<H>) => InferReturnType<H>>(
          handler: H,
        ): (
          ...args: InferParametersFromSecond<H>
        ) => Promise<
          Awaited<InferReturnType<H>> &
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
                  : T extends { reverification: any }
                    ? ReturnType<typeof reverificationMismatch<T['reverification']>> | ReturnType<typeof signedOut>
                    : ReturnType<typeof signedOut>)
        >;
      }
    : {
        with<K extends WithProtectActionParams>(key: K): Chainable<Merge<T, K>>;
        // @ts-ignore
        action<H extends (_auth: CustomAuthObject<T>, ...args: InferParametersFromSecond<H>) => InferReturnType<H>>(
          handler: H,
        ): (
          ...args: InferParametersFromSecond<H>
        ) => Promise<
          Awaited<InferReturnType<H>> &
            (T extends { permission: any; role: any }
              ?
                  | ReturnType<typeof permissionMismatch<T['permission']>>
                  | ReturnType<typeof roleMismatch<T['role']>>
                  | ReturnType<typeof signedOut>
              : T extends { permission: any }
                ? ReturnType<typeof permissionMismatch<T['permission']>> | ReturnType<typeof signedOut>
                : T extends { role: any }
                  ? ReturnType<typeof roleMismatch<T['role']>> | ReturnType<typeof signedOut>
                  : ReturnType<typeof signedOut>)
        >;
      };

function __experimental_protectAction() {
  const configs: __internal_ProtectConfiguration[] = [{}];
  const createBuilder = <A extends object>(config: A): Chainable => {
    // We will accumulate permissions here
    return {
      // @ts-expect-error
      with(p) {
        configs.push(p);
        return createBuilder({ ...p, ...config });
      },
      // @ts-expect-error
      action(handler) {
        return async (...args) => {
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
}

export { __experimental_protectAction };
