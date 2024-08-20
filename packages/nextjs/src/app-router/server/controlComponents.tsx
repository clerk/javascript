import type { ProtectProps } from '@clerk/clerk-react';
import type {
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';
import React from 'react';

import { createGetAuth } from '../../server/createGetAuth';
import { authAuthHeaderMissing } from '../../server/errors';
import { isServerActionRequest } from '../../server/standalone-protect';
import { UserVerificationTrigger } from '../../support-components';
import { auth } from './auth';
import { buildRequestLike } from './utils';

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

  if (restAuthorizedParams.role || restAuthorizedParams.permission || restAuthorizedParams.assurance) {
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

export type _ProtectProps = (
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
    }
) & {
  assurance?: {
    level: 'firstFactor' | 'secondFactor' | 'multiFactor';
    maxAge: '10m' | '1h' | '4h' | '1d' | '1w';
  };
};

type AsyncComponentType<P> = (p: P) => JSX.Element | null | Promise<JSX.Element | null>;

// const protect = <P,>(
//   Component: AsyncComponentType<P>,
//   opts: _ProtectProps & {
//     fallback?: React.ComponentType<{ UserVerificationTrigger: typeof UserVerificationTrigger }>;
//   },
// ): AsyncComponentType<P> => {
//   return props => {
//     const { fallback, ...restAuthorizedParams } = opts;
//
//     const Fallback = opts.fallback;
//     const unauthorized = Fallback ? <Fallback UserVerificationTrigger={UserVerificationTrigger} /> : null;
//
//     const authorized = <Component {...(props as any)} />;
//
//     return (
//       <Protect
//         {...restAuthorizedParams}
//         fallback={unauthorized}
//       >
//         {authorized}
//       </Protect>
//     );
//
//     // if (!userId) {
//     //   return unauthorized;
//     // }
//     //
//     // /**
//     //  * Check against the results of `has` called inside the callback
//     //  */
//     // if (typeof restAuthorizedParams.condition === 'function') {
//     //   if (restAuthorizedParams.condition(has)) {
//     //     return authorized;
//     //   }
//     //   return unauthorized;
//     // }
//     //
//     // if (restAuthorizedParams.role || restAuthorizedParams.permission || restAuthorizedParams.assurance) {
//     //   if (has(restAuthorizedParams)) {
//     //     return authorized;
//     //   }
//     //   return unauthorized;
//     // }
//     //
//     // /**
//     //  * If neither of the authorization params are passed behave as the `<SignedIn/>`.
//     //  * If fallback is present render that instead of rendering nothing.
//     //  */
//     // return authorized;
//   };
// };

// const protect = <P,>(
//   handlerOrComponent: P,
//   opts: _ProtectProps & {
//     fallback?: React.ComponentType<{ UserVerificationTrigger: typeof UserVerificationTrigger }>;
//   },
// ): P => {
// function protect<P>(handlerOrComponent: AsyncComponentType<P>, opts: _ProtectProps): AsyncComponentType<P>;
// function protect<Req extends Request, Resp extends Response, O extends (req: Req) => Resp>(
//   handlerOrComponent: O,
//   opts: _ProtectProps,
// ): O;
// function protect(
//   handlerOrComponent: any,
//   opts: _ProtectProps & {
//     fallback?: React.ComponentType<{ UserVerificationTrigger: typeof UserVerificationTrigger }>;
//   },
// ): any {

type ProtectPropsWithFallback = _ProtectProps & {
  fallback: React.ComponentType<{ UserVerificationTrigger: typeof UserVerificationTrigger }>;
};

const protect = <H extends (...args: any) => any>(
  handlerOrComponent: H,
  opts: ReturnType<H> extends JSX.Element | null | Promise<JSX.Element> ? ProtectPropsWithFallback : _ProtectProps,
): H => {
  // @ts-ignore
  return async (...args: any[]) => {
    const { fallback: Fallback, ...restAuthorizedParams } = opts as ProtectPropsWithFallback;
    const Component = handlerOrComponent as unknown as AsyncComponentType<unknown>;

    // if fallback is present we want to return a Server Component
    if (Fallback) {
      const unauthorized = Fallback ? <Fallback UserVerificationTrigger={UserVerificationTrigger} /> : null;

      const authorized = <Component {...args[0]} />;

      return (
        <Protect
          {...restAuthorizedParams}
          fallback={unauthorized}
        >
          {authorized}
        </Protect>
      );
    }

    const request = buildRequestLike();
    const authObject = createGetAuth({
      debugLoggerName: 'auth()',
      noAuthStatusMessage: authAuthHeaderMissing(),
    })(request);

    const { headers } = request;

    const errorObj = {
      clerk_error: 'forbidden',
      reason: 'assurance',
      assurance: opts?.assurance,
    };

    if (isServerActionRequest(headers)) {
      if (authObject.has(opts)) {
        return handlerOrComponent(...args);
      }

      return errorObj;
    }

    if (authObject.has(opts)) {
      return handlerOrComponent(...args);
    }

    return new Response(JSON.stringify(errorObj), {
      status: 403,
    });

    // if (!userId) {
    //   return unauthorized;
    // }
    //
    // /**
    //  * Check against the results of `has` called inside the callback
    //  */
    // if (typeof restAuthorizedParams.condition === 'function') {
    //   if (restAuthorizedParams.condition(has)) {
    //     return authorized;
    //   }
    //   return unauthorized;
    // }
    //
    // if (restAuthorizedParams.role || restAuthorizedParams.permission || restAuthorizedParams.assurance) {
    //   if (has(restAuthorizedParams)) {
    //     return authorized;
    //   }
    //   return unauthorized;
    // }
    //
    // /**
    //  * If neither of the authorization params are passed behave as the `<SignedIn/>`.
    //  * If fallback is present render that instead of rendering nothing.
    //  */
    // return authorized;
  };
};

export { protect };
