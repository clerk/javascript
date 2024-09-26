import type { ProtectProps } from '@clerk/clerk-react';
import type {
  __experimental_SessionVerificationLevel,
  __experimental_SessionVerificationMaxAge,
  Autocomplete,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';
import { redirect } from 'next/navigation';
import React from 'react';

import { UserVerificationModal, UserVerificationTrigger } from '../../complementary-components';
import { auth } from './auth';

export function SignedIn(props: React.PropsWithChildren): React.JSX.Element | null {
  const { children } = props;
  const { userId } = auth();
  return userId ? <>{children}</> : null;
}

export function SignedOut(props: React.PropsWithChildren): React.JSX.Element | null {
  const { children } = props;
  const { userId } = auth();
  return userId ? null : <>{children}</>;
}

/**
 * Use `<Protect/>` in order to prevent unauthenticated or unauthorized users from accessing the children passed to the component.
 *
 * Examples:
 * ```
 * <Protect permission="a_permission_key" />
 * <Protect role="a_role_key" />
 * <Protect condition={(has) => has({permission:"a_permission_key"})} />
 * <Protect condition={(has) => has({role:"a_role_key"})} />
 * <Protect fallback={<p>Unauthorized</p>} />
 * ```
 */
export function Protect(props: ProtectProps): React.JSX.Element | null {
  const { children, fallback, ...restAuthorizedParams } = props;
  const { has, userId } = auth();

  /**
   * Fallback to UI provided by user or `null` if authorization checks failed
   */
  const unauthorized = fallback ? <>{fallback}</> : null;

  const authorized = <>{children}</>;

  if (!userId) {
    return unauthorized;
  }

  /**
   * Check against the results of `has` called inside the callback
   */
  if (typeof restAuthorizedParams.condition === 'function') {
    if (restAuthorizedParams.condition(has)) {
      return authorized;
    }
    return unauthorized;
  }

  if (
    restAuthorizedParams.role ||
    restAuthorizedParams.permission ||
    (restAuthorizedParams as any).__experimental_assurance
  ) {
    if (has(restAuthorizedParams)) {
      return authorized;
    }
    return unauthorized;
  }

  /**
   * If neither of the authorization params are passed behave as the `<SignedIn/>`.
   * If fallback is present render that instead of rendering nothing.
   */
  return authorized;
}

// type AsyncComponentType<P> = (p: P) => JSX.Element | null | Promise<JSX.Element | null>;

// @ts-ignore
// const protect = (params: { permission: string; redirectUrl: string; fallback?: React.ComponentType }) => {
//   console.log('WOWOW', this);
//   // @ts-ignore
//   const globalConfig = [];
//   globalConfig.push(params);
//   // @ts-ignore
//   this.globalConfig = globalConfig;
//
//   const renderer = <P,>(Component: React.ComponentType<P>) => {
//     return (props: P) => {
//       //@ts-ignore
//       console.log('Config', this?.globalConfig || globalConfig);
//       // if fallback is present we want to return a Server Component
//       if (params?.fallback) {
//         const Fallback = params.fallback;
//         return <Fallback />;
//       }
//
//       // @ts-ignore
//       return <Component {...props} />;
//     };
//   };
//
//   return {
//     globalConfig,
//     protect: protect.bind(this),
//     component: renderer.bind(this),
//   };
// };

// type ProtectParams = { permission: string; redirectUrl: string; fallback?: React.ComponentType };

type ProtectParams =
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
      assurance?: never;
      redirectUrl?: never;
      fallback?: React.ComponentType;
    }
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
      assurance?: never;
      redirectUrl?: string;
      fallback?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
      assurance?: never;
      redirectUrl?: never;
      fallback?: React.ComponentType;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
      assurance?: never;
      redirectUrl?: Autocomplete<'sign-in'>;
      fallback?: never;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
      assurance?: never;
      redirectUrl?: string;
      fallback?: React.ComponentType;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
      assurance: {
        level: __experimental_SessionVerificationLevel;
        maxAge: __experimental_SessionVerificationMaxAge;
      };
      redirectUrl?: never;
      fallback?: React.ComponentType | 'modal';
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
      assurance?: never;
      redirectUrl?: string;
      fallback?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
      assurance?: never;
      redirectUrl?: never;
      fallback?: React.ComponentType;
    };

// type ProtectParams =
//   | {
//       role: OrganizationCustomRoleKey;
//     }
//   | {
//       role: OrganizationCustomRoleKey;
//       redirectUrl: string;
//     }
//   | {
//       role: OrganizationCustomRoleKey;
//       fallback: React.ComponentType;
//     }
//   | {
//       permission: OrganizationCustomPermissionKey;
//     }
//   | {
//       permission: OrganizationCustomPermissionKey;
//       redirectUrl: string;
//     }
//   | {
//       permission: OrganizationCustomPermissionKey;
//       fallback: React.ComponentType;
//     }
//   | {
//       assurance: {
//         level: __experimental_SessionVerificationLevel;
//         maxAge: __experimental_SessionVerificationMaxAge;
//       };
//     }
//   | {
//       assurance: {
//         level: __experimental_SessionVerificationLevel;
//         maxAge: __experimental_SessionVerificationMaxAge;
//       };
//       fallback: React.ComponentType;
//     }
//   | {
//       redirectUrl: string;
//     }
//   | {
//       fallback: React.ComponentType;
//     }
//   | undefined;

const findFailedItem = (
  configs: ProtectParams[],
  has: CheckAuthorizationWithCustomPermissions,
): ProtectParams | undefined => {
  const finals = configs.map(config => {
    const { role, permission, assurance } = config as any;
    if (permission) {
      return has({ permission });
    }
    if (role) {
      return has({ role });
    }
    if (assurance) {
      return has({ __experimental_assurance: assurance });
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

type MyAuth = ReturnType<typeof auth>;

// type InferParameters<T> = T extends (...args: infer P) => any ? P : never;
type InferParameters2<T> = T extends (auth: any, ...args: infer P) => any ? P : never;
type InferParameters3<T> = T extends (auth: any, req: Request, ...args: infer P) => any ? P : never;

type InferReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
// type NonNullable<T> = T extends null | undefined ? never : T;

// Helper to infer the strict type of the result
type InferStrictTypeParams<T extends ProtectParams> = T;

type NonNullable<T> = T extends null | undefined ? never : T;
type NonNullableRecord<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

function defineProtectParams<T extends ProtectParams>(params: T) {
  return params;
}

function protect<T extends ProtectParams>(params: T) {
  // We will accumulate permissions here
  const configs: ProtectParams[] = [params];

  function protectNext(nextParams: ProtectParams) {
    // Add the next permission to the array
    configs.push(nextParams);
    // Return the same function to allow chaining
    return { protect: protectNext, component, action, route };
  }

  const component = <P,>(
    Component: React.ComponentType<
      P & {
        auth: InferStrictTypeParams<T> extends { permission: any } | { role: any }
          ? NonNullableRecord<MyAuth, 'orgId' | 'userId' | 'sessionId' | 'orgRole' | 'orgPermissions'>
          : NonNullableRecord<MyAuth, 'userId'>;
      }
    >,
  ) => {
    return (props: P) => {
      const _auth = auth();
      const { has, redirectToSignIn } = _auth;

      const failedItem = findFailedItem(configs, has) as any;

      if (failedItem?.fallback) {
        const Fallback = failedItem.fallback;

        if (Fallback === 'modal') {
          return <UserVerificationModal />;
        }

        if (typeof Fallback !== 'function') {
          throw 'not valid';
        }

        return (
          <Fallback
            {
              // Could this be unsafe ?
              ...props
            }
            UserVerificationTrigger={UserVerificationTrigger}
          />
        );
      }

      if (failedItem?.redirectUrl === 'sign-in') {
        redirectToSignIn();
      }

      if (failedItem?.redirectUrl) {
        redirect(failedItem.redirectUrl);
      }

      if (failedItem) {
        return null;
      }

      return (
        // @ts-ignore not sure why this errors
        <Component
          {...props}
          auth={_auth}
        />
      );
    };
  };

  // Maybe this should return the correct types instead of hiding them
  const action =
    <
      H extends (
        _auth: InferStrictTypeParams<T> extends { permission: any } | { role: any }
          ? NonNullableRecord<MyAuth, 'orgId' | 'userId' | 'sessionId' | 'orgRole' | 'orgPermissions'>
          : NonNullableRecord<MyAuth, 'userId'>,
        ...args: InferParameters2<H>
      ) => InferReturnType<H>,
    >(
      handler: H,
    ) =>
    (
      ...args: InferParameters2<H>
    ):
      | InferReturnType<H>
      | Promise<
          InferStrictTypeParams<T> extends { assurance: any }
            ? {
                // a: InferStrictTypeParams<T>;
                clerk_error: {
                  type: 'forbidden';
                  reason: 'assurance';
                  metadata: Omit<InferStrictTypeParams<T>, 'fallback' | 'redirectUrl'>;
                  //   {
                  //   level: __experimental_SessionVerificationLevel;
                  //   maxAge: __experimental_SessionVerificationMaxAge;
                  // };
                };
              }
            : {
                clerk_error: {
                  type: 'something';
                  reason: 'something';
                  metadata: Omit<InferStrictTypeParams<T>, 'fallback' | 'redirectUrl'>;
                };
              }
        > => {
      const { has } = auth();
      const failedItem = findFailedItem(configs, has) as any;

      if (failedItem?.assurance) {
        const errorObj = {
          clerk_error: {
            type: 'forbidden',
            reason: 'assurance',
            metadata: failedItem.assurance as {
              level: __experimental_SessionVerificationLevel;
              maxAge: __experimental_SessionVerificationMaxAge;
            },
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
            metadata: failedItem as Omit<InferStrictTypeParams<T>, 'fallback' | 'redirectUrl'>,
          },
        };
      }

      if (failedItem) {
        auth().redirectToSignIn();
      }

      // @ts-ignore not sure why this errors
      return handler(auth(), ...args);
    };

  const route =
    <
      H extends (
        _auth: InferStrictTypeParams<T> extends { permission: any } | { role: any }
          ? NonNullableRecord<MyAuth, 'orgId' | 'userId' | 'sessionId' | 'orgRole' | 'orgPermissions'>
          : NonNullableRecord<MyAuth, 'userId'>,
        req: Request,
        ...args: InferParameters3<H>
      ) => Response | Promise<Response>,
    >(
      handler: H,
    ) =>
    (req: Request, ...args: InferParameters3<H>) => {
      const { has } = auth();
      const failedItem = findFailedItem(configs, has) as any;

      if (failedItem?.assurance) {
        const errorObj = {
          clerk_error: {
            type: 'forbidden',
            reason: 'assurance',
            metadata: failedItem.assurance as {
              level: __experimental_SessionVerificationLevel;
              maxAge: __experimental_SessionVerificationMaxAge;
            },
          },
        };

        return new Response(JSON.stringify(errorObj), {
          status: 403,
        });
      }

      if (failedItem?.role || failedItem?.permission) {
        return new Response(null, {
          status: 403,
        });
      }

      if (failedItem) {
        return new Response(null, {
          status: 401,
        });
      }

      // @ts-ignore auth does not match exactly
      return handler(auth(), req, ...args);
    };

  // Return the protect method and the component method to enable chaining
  return { protect: protectNext, component, action, route };
}

export { protect, defineProtectParams };
