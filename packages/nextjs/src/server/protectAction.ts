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
        | Promise<Awaited<InferReturnType<H>>>
        | Promise<
            InferStrictTypeParams<T> extends { reverification: any }
              ? ReturnType<typeof reverificationMismatch<T['reverification']>>
              : InferStrictTypeParams<T> extends
                    | { permission: any }
                    | {
                        role: any;
                      }
                ? InferStrictTypeParams<T> extends {
                    permission: any;
                  }
                  ? ReturnType<typeof permissionMismatch<T['permission']>>
                  : ReturnType<typeof roleMismatch<T['role']>>
                : ReturnType<typeof signedOut>
          > => {
        const _auth = auth();
        const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

        if (failedItem?.reverification) {
          //@ts-expect-error
          return reverificationMismatch(failedItem.reverification);
        }

        if (failedItem?.role) {
          //@ts-expect-error
          return roleMismatch(failedItem.role);
        }

        if (failedItem?.permission) {
          //@ts-expect-error
          return permissionMismatch(failedItem.permission);
        }

        if (failedItem) {
          // @ts-expect-error
          return signedOut();
        }

        // @ts-ignore not sure why ts complains TODO-STEP-UP
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
    ): Promise<Awaited<InferReturnType<H>>> | Promise<ReturnType<typeof signedOut>> => {
      const _auth = auth();
      const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

      if (failedItem) {
        // @ts-expect-error
        return signedOut();
      }
      // @ts-ignore not sure why ts complains TODO-STEP-UP
      return handler(auth(), ...args);
    };

  return { with: withNext, action };
}

export { __experimental_protectAction };
