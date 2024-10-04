import { AsyncLocalStorage } from 'node:async_hooks';

import type { AuthObject, ClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, ClerkRequest, RedirectFun, RequestState } from '@clerk/backend/internal';
import {
  AuthStatus,
  constants,
  createClerkRequest,
  createRedirect,
  EPHEMERAL_MODE_AVAILABLE,
} from '@clerk/backend/internal';
import { isClerkKeyError } from '@clerk/shared';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { EphemeralAccount } from '@clerk/types';
import type { NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, serverRedirectWithAuth, setHeader } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import { errorThrower } from './errorThrower';
import type { AuthProtect } from './protect';
import { createProtect } from './protect';
import type { NextMiddlewareEvtParam, NextMiddlewareRequestParam, NextMiddlewareReturn } from './types';
import {
  assertKey,
  decorateRequest,
  handleMultiDomainAndProxy,
  redirectAdapter,
  setRequestHeadersOnNextResponse,
} from './utils';

const CONTROL_FLOW_ERROR = {
  FORCE_NOT_FOUND: 'CLERK_PROTECT_REWRITE',
  REDIRECT_TO_URL: 'CLERK_PROTECT_REDIRECT_TO_URL',
  REDIRECT_TO_SIGN_IN: 'CLERK_PROTECT_REDIRECT_TO_SIGN_IN',
};

export type ClerkMiddlewareAuthObject = AuthObject & {
  protect: AuthProtect;
  redirectToSignIn: RedirectFun<Response>;
};

export type ClerkMiddlewareAuth = () => ClerkMiddlewareAuthObject;

type ClerkMiddlewareHandler = (
  auth: ClerkMiddlewareAuth,
  request: NextMiddlewareRequestParam,
  event: NextMiddlewareEvtParam,
) => NextMiddlewareReturn;

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & { debug?: boolean };

type ClerkMiddlewareOptionsCallback = (req: NextRequest) => ClerkMiddlewareOptions;

/**
 * Middleware for Next.js that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: https://clerk.com/docs/references/nextjs/clerk-middleware
 */
interface ClerkMiddleware {
  /**
   * @example
   * export default clerkMiddleware((auth, request, event) => { ... }, options);
   */
  (handler: ClerkMiddlewareHandler, options?: ClerkMiddlewareOptions): NextMiddleware;
  /**
   * @example
   * export default clerkMiddleware((auth, request, event) => { ... }, (req) => options);
   */
  (handler: ClerkMiddlewareHandler, options?: ClerkMiddlewareOptionsCallback): NextMiddleware;
  /**
   * @example
   * export default clerkMiddleware(options);
   */
  (options?: ClerkMiddlewareOptions): NextMiddleware;
  /**
   * @example
   * export default clerkMiddleware;
   */
  (request: NextMiddlewareRequestParam, event: NextMiddlewareEvtParam): NextMiddlewareReturn;
}

const clerkMiddlewareRequestDataStore = new Map<'requestData', AuthenticateRequestOptions>();
export const clerkMiddlewareRequestDataStorage = new AsyncLocalStorage<typeof clerkMiddlewareRequestDataStore>();

export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]): any => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);

  const ephemeralMode = EPHEMERAL_MODE_AVAILABLE;
  let ephemeralAccount: EphemeralAccount | undefined;

  return clerkMiddlewareRequestDataStorage.run(clerkMiddlewareRequestDataStore, () => {
    const baseNextMiddleware: NextMiddleware = withLogger('clerkMiddleware', logger => async (request, event) => {
      // Handles the case where `options` is a callback function to dynamically access `NextRequest`
      const resolvedParams = typeof params === 'function' ? params(request) : params;

      const publishableKey = assertKey(
        resolvedParams.publishableKey || PUBLISHABLE_KEY || ephemeralAccount?.publishableKey || '',
        () => errorThrower.throwMissingPublishableKeyError(),
      );
      const secretKey = assertKey(resolvedParams.secretKey || SECRET_KEY || ephemeralAccount?.secretKey || '', () =>
        errorThrower.throwMissingSecretKeyError(),
      );
      const signInUrl = resolvedParams.signInUrl || SIGN_IN_URL;
      const signUpUrl = resolvedParams.signUpUrl || SIGN_UP_URL;

      const options = {
        publishableKey,
        secretKey,
        signInUrl,
        signUpUrl,
        ...resolvedParams,
      };

      // Propagates the request data to be accessed on the server application runtime from helpers such as `clerkClient`
      clerkMiddlewareRequestDataStore.set('requestData', options);

      clerkClient().telemetry.record(
        eventMethodCalled('clerkMiddleware', {
          handler: Boolean(handler),
          satellite: Boolean(options.isSatellite),
          proxy: Boolean(options.proxyUrl),
        }),
      );

      if (options.debug) {
        logger.enable();
      }

      const clerkRequest = createClerkRequest(request);
      logger.debug('options', options);
      logger.debug('url', () => clerkRequest.toJSON());

      const requestState = await clerkClient().authenticateRequest(
        clerkRequest,
        createAuthenticateRequestOptions(clerkRequest, options),
      );

      logger.debug('requestState', () => ({
        status: requestState.status,
        headers: JSON.stringify(Object.fromEntries(requestState.headers)),
        reason: requestState.reason,
      }));

      const locationHeader = requestState.headers.get(constants.Headers.Location);
      if (locationHeader) {
        return new Response(null, { status: 307, headers: requestState.headers });
      } else if (requestState.status === AuthStatus.Handshake) {
        throw new Error('Clerk: handshake status without redirect');
      }

      const authObject = requestState.toAuth();
      logger.debug('auth', () => ({ auth: authObject, debug: authObject.debug() }));

      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const protect = createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);
      const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, { protect, redirectToSignIn });

      let handlerResult: Response = NextResponse.next();
      try {
        const userHandlerResult = await clerkMiddlewareRequestDataStorage.run(
          clerkMiddlewareRequestDataStore,
          async () => handler?.(() => authObjWithMethods, request, event),
        );
        handlerResult = userHandlerResult || handlerResult;
      } catch (e: any) {
        handlerResult = handleControlFlowErrors(e, clerkRequest, requestState);
      }

      // TODO @nikos: we need to make this more generic
      // and move the logic in clerk/backend
      if (requestState.headers) {
        requestState.headers.forEach((value, key) => {
          handlerResult.headers.append(key, value);
        });
      }

      if (isRedirect(handlerResult)) {
        logger.debug('handlerResult is redirect');
        return serverRedirectWithAuth(clerkRequest, handlerResult, options);
      }

      if (options.debug) {
        setRequestHeadersOnNextResponse(handlerResult, clerkRequest, { [constants.Headers.EnableDebug]: 'true' });
      }

      decorateRequest(clerkRequest, handlerResult, requestState, resolvedParams);

      return handlerResult;
    });

    const nextMiddleware: NextMiddleware = async (request, event) => {
      if (!ephemeralMode) {
        return await baseNextMiddleware(request, event);
      }

      const ephemeralParams = unpackEphemeralQueryParams(request);

      if (ephemeralParams) {
        ephemeralAccount = ephemeralParams;

        const response = new NextResponse(null, {
          status: 307,
          headers: { location: `${request.nextUrl.protocol}//${request.nextUrl.host}` },
        });

        const options = {
          expires: Number(ephemeralAccount.expiresAt) * 1000,
        };

        response.cookies.set(constants.Cookies.EphemeralExpiresAt, ephemeralAccount.expiresAt.toString(), options);
        response.cookies.set(constants.Cookies.EphemeralPublishableKey, ephemeralAccount.publishableKey, options);
        response.cookies.set(constants.Cookies.EphemeralSecretKey, ephemeralAccount.secretKey, options);

        return response;
      }

      try {
        const handlerResult = await baseNextMiddleware(request, event);

        return handlerResult;
      } catch (e: any) {
        // And this is a clerkKeyError, return a no-op to allow the ClerkProvider to fetch the keys
        if (isClerkKeyError(e)) {
          return null;
        }
        throw e;
      }
    };

    // If we have a request and event, we're being called as a middleware directly
    // eg, export default clerkMiddleware;
    if (request && event) {
      return nextMiddleware(request, event);
    }

    // Otherwise, return a middleware that can be called with a request and event
    // eg, export default clerkMiddleware(auth => { ... });
    return nextMiddleware;
  });
};

const parseRequestAndEvent = (args: unknown[]) => {
  return [args[0] instanceof Request ? args[0] : undefined, args[0] instanceof Request ? args[1] : undefined] as [
    NextMiddlewareRequestParam | undefined,
    NextMiddlewareEvtParam | undefined,
  ];
};

const parseHandlerAndOptions = (args: unknown[]) => {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [ClerkMiddlewareHandler | undefined, ClerkMiddlewareOptions | ClerkMiddlewareOptionsCallback];
};

type AuthenticateRequest = Pick<ClerkClient, 'authenticateRequest'>['authenticateRequest'];

export const createAuthenticateRequestOptions = (
  clerkRequest: ClerkRequest,
  options: ClerkMiddlewareOptions,
): Parameters<AuthenticateRequest>[1] => {
  return {
    ...options,
    ...handleMultiDomainAndProxy(clerkRequest, options),
  };
};

const createMiddlewareRedirectToSignIn = (
  clerkRequest: ClerkRequest,
): ClerkMiddlewareAuthObject['redirectToSignIn'] => {
  return (opts = {}) => {
    const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN) as any;
    err.returnBackUrl = opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkRequest.clerkUrl.toString();
    throw err;
  };
};

const createMiddlewareProtect = (
  clerkRequest: ClerkRequest,
  authObject: AuthObject,
  redirectToSignIn: RedirectFun<Response>,
): ClerkMiddlewareAuthObject['protect'] => {
  return ((params, options) => {
    const notFound = () => {
      throw new Error(CONTROL_FLOW_ERROR.FORCE_NOT_FOUND) as any;
    };

    const redirect = (url: string) => {
      const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_URL) as any;
      err.redirectUrl = url;
      throw err;
    };

    // @ts-expect-error TS is not happy even though the types are correct
    return createProtect({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  }) as AuthProtect;
};

// Handle errors thrown by protect() and redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (e: any, clerkRequest: ClerkRequest, requestState: RequestState): Response => {
  switch (e.message) {
    case CONTROL_FLOW_ERROR.FORCE_NOT_FOUND:
      // Rewrite to a bogus URL to force not found error
      return setHeader(
        NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`),
        constants.Headers.AuthReason,
        'protect-rewrite',
      );
    case CONTROL_FLOW_ERROR.REDIRECT_TO_URL:
      return redirectAdapter(e.redirectUrl);
    case CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN:
      return createRedirect({
        redirectAdapter,
        baseUrl: clerkRequest.clerkUrl,
        signInUrl: requestState.signInUrl,
        signUpUrl: requestState.signUpUrl,
        publishableKey: requestState.publishableKey,
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};

const unpackEphemeralQueryParams = (request: NextMiddlewareRequestParam): EphemeralAccount | undefined => {
  const params = Object.fromEntries(request.nextUrl.searchParams);

  const ephemeralParams = {
    expiresAt: params[constants.QueryParameters.EphemeralExpiresAt],
    publishableKey: params[constants.QueryParameters.EphemeralPublishableKey],
    secretKey: params[constants.QueryParameters.EphemeralSecretKey],
  };

  const maybeEphemeral = Object.fromEntries(
    Object.entries(ephemeralParams).filter(([_, v]) => v != null),
  ) as Partial<EphemeralAccount>;

  if (Object.keys(maybeEphemeral).length === Object.keys(ephemeralParams).length) {
    return maybeEphemeral as EphemeralAccount;
  } else {
    return undefined;
  }
};
