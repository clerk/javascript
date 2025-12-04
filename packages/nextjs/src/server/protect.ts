import type { AuthObject } from '@clerk/backend';
import type {
  AuthenticatedMachineObject,
  AuthenticateRequestOptions,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  RedirectFun,
  SignedInAuthObject,
} from '@clerk/backend/internal';
import { constants, isTokenTypeAccepted, TokenType } from '@clerk/backend/internal';
import type {
  CheckAuthorizationFromSessionClaims,
  CheckAuthorizationParamsFromSessionClaims,
  CheckAuthorizationParamsWithCustomPermissions,
  CheckAuthorizationWithCustomPermissions,
  OrganizationCustomPermissionKey,
} from '@clerk/shared/types';

import { constants as nextConstants } from '../constants';
import { isNextFetcher } from './nextFetcher';

type AuthProtectOptions = {
  /**
   * The token type to check.
   */
  token?: AuthenticateRequestOptions['acceptsToken'];
  /**
   * The URL to redirect the user to if they are not authorized.
   */
  unauthorizedUrl?: string;
  /**
   * The URL to redirect the user to if they are not authenticated.
   */
  unauthenticatedUrl?: string;
};

/**
 * Throws a Nextjs notFound error if user is not authenticated or authorized.
 */
export interface AuthProtect {
  /**
   * @example
   * auth.protect({ permission: 'org:admin:example1' });
   * auth.protect({ role: 'admin' });
   */
  <P extends OrganizationCustomPermissionKey>(
    params?: CheckAuthorizationParamsFromSessionClaims<P>,
    options?: AuthProtectOptions,
  ): Promise<SignedInAuthObject>;

  /**
   * @example
   * auth.protect(has => has({ permission: 'org:admin:example1' }));
   */
  (
    params?: (has: CheckAuthorizationFromSessionClaims) => boolean,
    options?: AuthProtectOptions,
  ): Promise<SignedInAuthObject>;

  /**
   * @example
   * auth.protect({ token: 'session_token' });
   */
  <T extends TokenType>(
    options?: AuthProtectOptions & { token: T },
  ): Promise<InferAuthObjectFromToken<T, SignedInAuthObject, AuthenticatedMachineObject>>;

  /**
   * @example
   * auth.protect({ token: ['session_token', 'm2m_token'] });
   */
  <T extends TokenType[]>(
    options?: AuthProtectOptions & { token: T },
  ): Promise<InferAuthObjectFromTokenArray<T, SignedInAuthObject, AuthenticatedMachineObject>>;

  /**
   * @example
   * auth.protect({ token: 'any' });
   */
  (options?: AuthProtectOptions & { token: 'any' }): Promise<SignedInAuthObject | AuthenticatedMachineObject>;

  /**
   * @example
   * auth.protect();
   */
  (options?: AuthProtectOptions): Promise<SignedInAuthObject>;
}

export function createProtect(opts: {
  request: Request;
  authObject: AuthObject;
  /**
   * middleware and pages throw a notFound error if signed out
   * but the middleware needs to throw an error it can catch
   * use this callback to customise the behavior
   */
  notFound: () => never;
  /**
   * see {@link notFound} above
   */
  redirect: (url: string) => void;
  /**
   * For m2m requests, throws a 401 response
   */
  unauthorized: () => void;
  /**
   * protect() in middleware redirects to signInUrl if signed out
   * protect() in pages throws a notFound error if signed out
   * use this callback to customise the behavior
   */
  redirectToSignIn: RedirectFun<unknown>;
}): AuthProtect {
  const { redirectToSignIn, authObject, redirect, notFound, request, unauthorized } = opts;

  return (async (...args: any[]) => {
    const paramsOrFunction = getAuthorizationParams(args[0]);
    const unauthenticatedUrl = (args[0]?.unauthenticatedUrl || args[1]?.unauthenticatedUrl) as string | undefined;
    const unauthorizedUrl = (args[0]?.unauthorizedUrl || args[1]?.unauthorizedUrl) as string | undefined;
    const requestedToken = args[0]?.token || args[1]?.token || TokenType.SessionToken;

    const handleUnauthenticated = () => {
      if (unauthenticatedUrl) {
        return redirect(unauthenticatedUrl);
      }
      if (isPageRequest(request)) {
        // TODO: Handle runtime values. What happens if runtime values are set in middleware and in ClerkProvider as well?
        return redirectToSignIn();
      }
      return notFound();
    };

    const handleUnauthorized = () => {
      // For machine tokens, return a 401 response
      if (authObject.tokenType !== TokenType.SessionToken) {
        return unauthorized();
      }

      if (unauthorizedUrl) {
        return redirect(unauthorizedUrl);
      }
      return notFound();
    };

    if (!isTokenTypeAccepted(authObject.tokenType, requestedToken)) {
      return handleUnauthorized();
    }

    if (authObject.tokenType !== TokenType.SessionToken) {
      // For machine tokens, we only check if they're authenticated
      // They don't have session status or organization permissions
      if (!authObject.isAuthenticated) {
        return handleUnauthorized();
      }
      return authObject;
    }

    /**
     * Redirects the user back to the tasks URL if their session status is pending
     */
    if (authObject.sessionStatus === 'pending') {
      return handleUnauthenticated();
    }

    /**
     * User is not authenticated
     */
    if (!authObject.userId) {
      return handleUnauthenticated();
    }

    /**
     * User is authenticated
     */
    if (!paramsOrFunction) {
      return authObject;
    }

    /**
     * if a function is passed and returns false then throw not found
     */
    if (typeof paramsOrFunction === 'function') {
      if (paramsOrFunction(authObject.has)) {
        return authObject;
      }
      return handleUnauthorized();
    }

    /**
     * Checking if user is authorized when permission or role is passed
     */
    if (authObject.has(paramsOrFunction)) {
      return authObject;
    }

    return handleUnauthorized();
  }) as AuthProtect;
}

const getAuthorizationParams = (arg: any) => {
  if (!arg) {
    return undefined;
  }

  // Skip authorization check if the arg contains any of these options
  if (arg.unauthenticatedUrl || arg.unauthorizedUrl || arg.token) {
    return undefined;
  }

  // Skip if it's just a token-only object
  if (Object.keys(arg).length === 1 && 'token' in arg) {
    return undefined;
  }

  // Return the authorization params/function
  return arg as
    | CheckAuthorizationParamsWithCustomPermissions
    | ((has: CheckAuthorizationWithCustomPermissions) => boolean);
};

const isServerActionRequest = (req: Request) => {
  return (
    !!req.headers.get(nextConstants.Headers.NextUrl) &&
    (req.headers.get(constants.Headers.Accept)?.includes('text/x-component') ||
      req.headers.get(constants.Headers.ContentType)?.includes('multipart/form-data') ||
      !!req.headers.get(nextConstants.Headers.NextAction))
  );
};

const isPageRequest = (req: Request): boolean => {
  return (
    req.headers.get(constants.Headers.SecFetchDest) === 'document' ||
    req.headers.get(constants.Headers.SecFetchDest) === 'iframe' ||
    req.headers.get(constants.Headers.Accept)?.includes('text/html') ||
    isAppRouterInternalNavigation(req) ||
    isPagesRouterInternalNavigation(req)
  );
};

const isAppRouterInternalNavigation = (req: Request) =>
  (!!req.headers.get(nextConstants.Headers.NextUrl) && !isServerActionRequest(req)) || isPagePathAvailable();

const isPagePathAvailable = () => {
  const __fetch = globalThis.fetch;

  if (!isNextFetcher(__fetch)) {
    return false;
  }

  const { page } = __fetch.__nextGetStaticStore().getStore() || {};

  return Boolean(page);
};

const isPagesRouterInternalNavigation = (req: Request) => !!req.headers.get(nextConstants.Headers.NextjsData);

// /**
//  * In case we want to handle router handlers and server actions differently in the future
//  */
// const isApiRouteRequest = (req: Request) => {
//   return !isPageRequest(req) && !isServerActionRequest(req);
// };
