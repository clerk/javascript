import type {
  __experimental_SessionVerificationLevel,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

import { auth } from '../app-router/server/auth';

type MyAuth = ReturnType<typeof auth>;
type InferParametersFromThird<T> = T extends (auth: any, req: Request, ...args: infer P) => any ? P : never;

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
      console.log('has reverification param');
      const a = has({ __experimental_reverification: reverification });
      console.log('has reverification result', a);
      return a;
    }
    // this just checks for sign-out
    return !!auth().userId;
    // return has({});
  });

  console.log('finals', finals);

  const failedItemIndex = finals.findIndex(a => a === false);

  const failedItem = configs[failedItemIndex];

  console.log('failedItem', failedItem);
  return failedItem;
};

function protectRoute() {
  // We will accumulate permissions here
  const configs: MixedActionParams[] = [{}];

  const withNext = <T extends WithProtectActionParams>(nextParams: T) => {
    configs.push(nextParams);

    // Maybe this should return the correct types instead of hiding them
    const route =
      <
        H extends (
          _auth: CustomAuthObject<T>,
          req: Request,
          ...args: InferParametersFromThird<H>
        ) => Response | Promise<Response>,
      >(
        handler: H,
      ) =>
      (req: Request, ...args: InferParametersFromThird<H>): Response | Promise<Response> => {
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

          return new Response(JSON.stringify(errorObj), {
            status: 403,
          });
        }

        if (failedItem?.role || failedItem?.permission) {
          // What should we do here ?
          return new Response(
            JSON.stringify({
              clerk_error: {
                type: 'something',
                reason: 'something',
                metadata: failedItem,
              },
            }),
            {
              status: 403,
            },
          );
        }
        if (failedItem) {
          return new Response(
            JSON.stringify({
              clerk_error: {
                type: 'unauthorized',
                reason: 'signed-out',
              },
            }),
            {
              status: 403,
            },
          );
        }

        // @ts-ignore not sure why this errors
        return handler(auth(), req, ...args);
      };
    return { with: withNext<WithProtectActionParams>, route };
  };

  const route =
    <
      H extends (
        _auth: NonNullableRecord<MyAuth, 'userId'>,
        req: Request,
        ...args: InferParametersFromThird<H>
      ) => Response | Promise<Response>,
    >(
      handler: H,
    ) =>
    (req: Request, ...args: InferParametersFromThird<H>): Response | Promise<Response> => {
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

        return new Response(JSON.stringify(errorObj), {
          status: 403,
        });
      }

      if (failedItem?.role || failedItem?.permission) {
        // What should we do here ?
        return new Response(
          JSON.stringify({
            clerk_error: {
              type: 'something',
              reason: 'something',
              metadata: failedItem,
            },
          }),
          {
            status: 403,
          },
        );
      }

      if (failedItem) {
        return new Response(
          JSON.stringify({
            clerk_error: {
              type: 'unauthorized',
              reason: 'signed-out',
            },
          }),
          {
            status: 403,
          },
        );
      }

      // @ts-ignore not sure why this errors
      return handler(auth(), req, ...args);
    };

  return { with: withNext, route };
}

export { protectRoute };
