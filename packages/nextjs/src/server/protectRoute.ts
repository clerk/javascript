import type { ProtectConfiguration } from '@clerk/shared/protect';
import { __internal_findFailedProtectConfiguration } from '@clerk/shared/protect';
import type {
  __experimental_SessionVerificationLevel,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';

import { auth } from '../app-router/server/auth';

type MyAuth = ReturnType<typeof auth>;
type InferParametersFromThird<T> = T extends (auth: any, req: Request, ...args: infer P) => any ? P : never;

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

function protectRoute() {
  // We will accumulate permissions here
  const configs: ProtectConfiguration[] = [{}];

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
              status: 401,
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
      const _auth = auth();
      const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

      if (failedItem) {
        return new Response(
          JSON.stringify({
            clerk_error: {
              type: 'unauthorized',
              reason: 'signed-out',
            },
          }),
          {
            status: 401,
          },
        );
      }

      // @ts-ignore not sure why this errors
      return handler(auth(), req, ...args);
    };

  return { with: withNext, route };
}

export { protectRoute };
