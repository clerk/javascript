import type { ProtectProps } from '@clerk/clerk-react';
import type {
  __experimental_SessionVerificationLevel,
  __experimental_SessionVerificationMaxAge,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';
import { notFound, redirect } from 'next/navigation';
import React from 'react';

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
      redirectUrl?: string;
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
      fallback?: React.ComponentType;
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

type InferParameters<T> = T extends (...args: infer P) => any ? P : never;
type InferReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Helper to infer the strict type of the result
type InferStrictTypeParams<T extends ProtectParams> = T;

function protect<T extends ProtectParams>(params: T) {
  // We will accumulate permissions here
  const configs: ProtectParams[] = [params];

  function protectNext(nextParams: ProtectParams) {
    // Add the next permission to the array
    configs.push(nextParams);
    // Return the same function to allow chaining
    return { protect: protectNext, component, action, route };
  }

  const component = <P,>(Component: React.ComponentType<P>) => {
    return (props: P) => {
      const { has } = auth();

      const failedItem = findFailedItem(configs, has) as any;

      if (failedItem?.fallback) {
        const Fallback = failedItem.fallback;
        return <Fallback />;
      }

      if (failedItem?.redirectUrl) {
        redirect(failedItem.redirectUrl);
      }

      // @ts-ignore not sure why this errors
      return <Component {...props} />;
    };
  };

  // Maybe this should return the correct types instead of hiding them
  const action =
    // <H extends (...args: InferParameters<H>) => InferReturnType<H>>(handler: H) =>
    // (...args: InferParameters<H>): InferReturnType<H> => {


      <H extends (...args: InferParameters<H>) => InferReturnType<H>>(handler: H) =>
      (
        ...args: InferParameters<H>
      ):
        | InferReturnType<H>
        | Promise<{
            // a: InferStrictTypeParams<T>;
            clerk_error: {
              type: 'forbidden';
              reason: 'assurance';
              metadata: InferStrictTypeParams<T>;
              //   {
              //   level: __experimental_SessionVerificationLevel;
              //   maxAge: __experimental_SessionVerificationMaxAge;
              // };
            };
          }> => {
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

        if (failedItem) {
          // What should we do here ?
          return notFound();
        }

        return handler(...args);
      };

  const route =
    <H extends (req: Request) => Response | Promise<Response>>(handler: H) =>
    (req: Request) => {
      const { has } = auth();
      const failedItem = findFailedItem(configs, has) as any;

      if (failedItem?.assurance) {
        const errorObj = {
          clerk_error: {
            type: 'forbidden',
            reason: 'assurance',
            metadata: failedItem.assurance,
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

      return handler(req);
    };

  // Return the protect method and the component method to enable chaining
  return { protect: protectNext, component, action, route };
}

export { protect };
