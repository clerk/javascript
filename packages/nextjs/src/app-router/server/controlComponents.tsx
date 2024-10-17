import type { ProtectProps } from '@clerk/clerk-react';
import type { __internal_ProtectConfiguration } from '@clerk/shared';
import { __internal_findFailedProtectConfiguration } from '@clerk/shared';
import type {
  __experimental_SessionVerificationLevel,
  Autocomplete,
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

  if (restAuthorizedParams.role || restAuthorizedParams.permission) {
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

type NextServerProtectConfiguration = __internal_ProtectConfiguration & {
  fallback?: React.ComponentType | Autocomplete<'redirectToSignIn' | 'modal'>;
};

type MyAuth = ReturnType<typeof auth>;
type InferStrictTypeParams<T extends WithProtectComponentParams> = T;

type NonNullable<T> = T extends null | undefined ? never : T;
type NonNullableRecord<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

type WithProtectComponentParams =
  | {
      role: OrganizationCustomRoleKey;
      permission?: never;
      reverification?: never;
      fallback?: React.ComponentType | string;
    }
  | {
      role?: never;
      permission: OrganizationCustomPermissionKey;
      reverification?: never;
      fallback?: React.ComponentType | string;
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
      fallback?: React.ComponentType | 'modal';
    };

type ProtectComponentParams = {
  fallback?: React.ComponentType | 'redirectToSignIn';
};

type ComponentParam<Props, AuthObject> = React.ComponentType<
  Props & {
    auth: AuthObject;
  }
>;

type CustomAuthObject<T extends WithProtectComponentParams> =
  InferStrictTypeParams<T> extends
    | { permission: any }
    | {
        role: any;
      }
    ? NonNullableRecord<MyAuth, 'orgId' | 'userId' | 'sessionId' | 'orgRole' | 'orgPermissions'>
    : NonNullableRecord<MyAuth, 'userId' | 'sessionId'>;

type Merge<T, U> = T & U extends infer O ? { [K in keyof O]: O[K] } : never;

type HasReverification<T> = T extends { reverification: any } ? true : false;

// Chainable type that keeps track of whether reverification has been set
// @ts-ignore
type ChainableComponent<T = object> =
  HasReverification<T> extends true
    ? {
        // @ts-ignore
        component<P>(Component: ComponentParam<P, CustomAuthObject<T>>): (props: P) => React.JSX.Element | null;
      }
    : {
        with<K extends WithProtectComponentParams>(key: K): ChainableComponent<Merge<T, K>>;
        // @ts-ignore
        component<P>(
          Component: ComponentParam<P, NonNullableRecord<MyAuth, 'userId'>>,
        ): (props: P) => React.JSX.Element | null;
      };

function __experimental_protectComponent(params?: ProtectComponentParams) {
  const configs: NextServerProtectConfiguration[] = params ? [params] : [{}];
  const createBuilder = <A extends object>(config: A): ChainableComponent => {
    // We will accumulate permissions here
    return {
      // @ts-expect-error
      with(p) {
        configs.push(p);
        return createBuilder({ ...p, ...config });
      },

      component(Component) {
        return props => {
          const _auth = auth();

          const failedItem = __internal_findFailedProtectConfiguration(configs, _auth);

          if (failedItem?.fallback) {
            const Fallback = failedItem.fallback;

            if (Fallback === 'modal') {
              return <UserVerificationModal />;
            }

            if (Fallback === 'redirectToSignIn') {
              _auth.redirectToSignIn();
            }

            if (typeof Fallback === 'string') {
              redirect(Fallback);
            }

            if (typeof Fallback !== 'function') {
              throw 'not valid';
            }

            if (!failedItem.reverification) {
              return (
                // @ts-expect-error type props
                <Fallback
                  {
                    // Could this be unsafe ?
                    ...props
                  }
                />
              );
            }

            return (
              // @ts-expect-error type props
              <Fallback
                {
                  // Could this be unsafe ?
                  ...props
                }
                UserVerificationTrigger={UserVerificationTrigger}
              />
            );
          }

          if (failedItem) {
            return null;
          }

          return (
            <Component
              {...props}
              auth={_auth as any}
            />
          );
        };
      },
    };
  };
  return createBuilder({});
}

export { __experimental_protectComponent };
