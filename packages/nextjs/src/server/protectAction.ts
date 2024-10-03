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

type InferStrictTypeParams<T extends WithProtectActionParams> = T;

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

function __experimental_protectAction() {
  // We will accumulate permissions here
  const configs: __internal_ProtectConfiguration[] = [{}];

  const withNext = <T extends WithProtectActionParams>(nextParams: T) => {
    configs.push(nextParams);

    // Maybe this should return the correct types instead of hiding them
    const action =
      <H extends (_auth: CustomAuthObject<T>, ...args: InferParametersFromSecond<H>) => InferReturnType<H>>(
        handler: H,
      ) =>
      (
        ...args: InferParametersFromSecond<H>
      ):
        | InferReturnType<H>
        | Promise<
            InferStrictTypeParams<T> extends { reverification: any }
              ? {
                  clerk_error: {
                    type: 'forbidden';
                    reason: 'assurance';
                    metadata: Omit<InferStrictTypeParams<T>, 'fallback'>;
                  };
                }
              : InferStrictTypeParams<T> extends
                    | { permission: any }
                    | {
                        role: any;
                      }
                ? {
                    clerk_error: {
                      type: 'something';
                      reason: 'something';
                      metadata: Omit<InferStrictTypeParams<T>, 'fallback'>;
                    };
                  }
                : {
                    clerk_error: {
                      type: 'unauthorized';
                      reason: 'signed-out';
                    };
                  }
          > => {
        const _auth = auth();
        const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

        if (failedItem?.reverification) {
          const errorObj = {
            clerk_error: {
              type: 'forbidden',
              reason: 'assurance',
              metadata: failedItem.reverification,
            },
          } as const;

          //@ts-ignore
          return errorObj;
        }

        if (failedItem?.role || failedItem?.permission) {
          // What should we do here ?
          return {
            //@ts-ignore
            clerk_error: {
              type: 'something',
              reason: 'something',
              metadata: failedItem,
            },
          };
        }

        if (failedItem) {
          return {
            //@ts-ignore
            clerk_error: {
              type: 'unauthorized',
              reason: 'signed-out',
            },
          };
        }

        // @ts-ignore not sure why this errors
        return handler(auth(), ...args);
      };
    return { with: withNext<WithProtectActionParams>, action };
  };

  const action =
    <
      H extends (
        _auth: NonNullableRecord<MyAuth, 'userId'>,
        ...args: InferParametersFromSecond<H>
      ) => InferReturnType<H>,
    >(
      handler: H,
    ) =>
    (
      ...args: InferParametersFromSecond<H>
    ):
      | InferReturnType<H>
      | Promise<{
          clerk_error: {
            type: 'unauthorized';
            reason: 'signed-out';
          };
        }> => {
      const _auth = auth();
      const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

      if (failedItem) {
        return {
          //@ts-ignore
          clerk_error: {
            type: 'unauthorized',
            reason: 'signed-out',
          },
        };
      }
      // @ts-ignore not sure why this errors
      return handler(auth(), ...args);
    };

  return { with: withNext, action };
}

export { __experimental_protectAction };
