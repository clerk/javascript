import type {
  __experimental_SessionVerificationLevel,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

import { auth } from '../app-router/server/auth';

type MyAuth = ReturnType<typeof auth>;

type InferParametersFromSecond<T> = T extends (auth: any, ...args: infer P) => any ? P : never;

type InferReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type InferStrictTypeParams2<T extends WithProtectActionParams> = T;

type NonNullable<T> = T extends null | undefined ? never : T;
type NonNullableRecord<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

type WithProtectActionParams =
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
      reverification?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
      reverification?: never;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
      reverification?: never;
    }
  | {
      condition?: never;
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
  InferStrictTypeParams2<T> extends
    | { permission: any }
    | {
        role: any;
      }
    ? NonNullableRecord<MyAuth, 'orgId' | 'userId' | 'sessionId' | 'orgRole' | 'orgPermissions'>
    : NonNullableRecord<MyAuth, 'userId'>;

type MixedActionParams = {
  reverification?:
    | 'veryStrict'
    | 'strict'
    | 'moderate'
    | 'lax'
    | {
        level: __experimental_SessionVerificationLevel;
        afterMinutes: number;
      };
  permission?: OrganizationCustomPermissionKey;
  role?: OrganizationCustomRoleKey;
};

const findFailedItemNew = (
  configs: MixedActionParams[],
  has: CheckAuthorizationWithCustomPermissions,
): MixedActionParams | undefined => {
  const finals = configs.map(config => {
    const { role, permission, reverification } = config as any;
    if (permission) {
      return has({ permission });
    }
    if (role) {
      return has({ role });
    }
    if (reverification) {
      return has({ __experimental_reverification: reverification });
    }
    // check for sign-out
    return !!auth().userId;
  });

  const failedItemIndex = finals.findIndex(a => a === false);

  return configs[failedItemIndex];
};

function protectAction() {
  // We will accumulate permissions here
  const configs: MixedActionParams[] = [{}];

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
            InferStrictTypeParams2<T> extends { reverification: any }
              ? {
                  // a: InferStrictTypeParams<T>;
                  clerk_error: {
                    type: 'forbidden';
                    reason: 'assurance';
                    metadata: Omit<InferStrictTypeParams2<T>, 'fallback'>;
                    //   {
                    //   level: __experimental_SessionVerificationLevel;
                    //   maxAge: __experimental_SessionVerificationMaxAge;
                    // };
                  };
                }
              : InferStrictTypeParams2<T> extends
                    | { permission: any }
                    | {
                        role: any;
                      }
                ? {
                    clerk_error: {
                      type: 'something';
                      reason: 'something';
                      metadata: Omit<InferStrictTypeParams2<T>, 'fallback'>;
                    };
                  }
                : {
                    clerk_error: {
                      type: 'unauthorized';
                      reason: 'signed-out';
                    };
                  }
          > => {
        const { has } = auth();
        const failedItem = findFailedItemNew(configs, has);
        console.log('protectAction failed item', failedItem);

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
      const { has } = auth();
      const failedItem = findFailedItemNew(configs, has);

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

  return { with: withNext, action };
}

export { protectAction };
