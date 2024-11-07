import { AsyncLocalStorage } from 'node:async_hooks';

import type { AuthObject, ClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, ClerkRequest, RedirectFun, RequestState } from '@clerk/backend/internal';
import { AuthStatus, constants, createClerkRequest, createRedirect } from '@clerk/backend/internal';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRedirect, serverRedirectWithAuth, setHeader } from '../utils';
import { withLogger } from '../utils/debugLogger';
import { getAccountlessCookie } from './accountless';
import { clerkClient } from './clerkClient';
import { PUBLISHABLE_KEY, SECRET_KEY, SIGN_IN_URL, SIGN_UP_URL } from './constants';
import { errorThrower } from './errorThrower';
import {
  isNextjsNotFoundError,
  isNextjsRedirectError,
  isRedirectToSignInError,
  nextjsNotFound,
  nextjsRedirectError,
  redirectToSignInError,
} from './nextErrors';
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

export type ClerkMiddlewareAuthObject = AuthObject & {
  redirectToSignIn: RedirectFun<Response>;
};

export interface ClerkMiddlewareAuth {
  (): Promise<ClerkMiddlewareAuthObject>;

  protect: AuthProtect;
}

type ClerkMiddlewareHandler = (
  auth: ClerkMiddlewareAuth,
  request: NextMiddlewareRequestParam,
  event: NextMiddlewareEvtParam,
) => NextMiddlewareReturn;

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & {
  debug?: boolean;
  tryAccountless?: boolean;
  tryAccountlessFile?: boolean;
};

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

// @ts-expect-error TS is not happy here. Will dig into it
export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]) => {
  const [request, event] = parseRequestAndEvent(args);
  const [handler, params] = parseHandlerAndOptions(args);

  return clerkMiddlewareRequestDataStorage.run(clerkMiddlewareRequestDataStore, () => {
    const baseNextMiddleware: NextMiddleware = withLogger('clerkMiddleware', logger => async (request, event) => {
      // Handles the case where `options` is a callback function to dynamically access `NextRequest`
      const resolvedParams = typeof params === 'function' ? params(request) : params;
      let resolvedClerkClient = await clerkClient();
      let accountless: any;
      let toWrite: string | undefined;
      const { tryAccountless = false, tryAccountlessFile = false } = resolvedParams;

      const accountlessCookieName = await getAccountlessCookie();

      if (tryAccountless && accountlessCookieName) {
        accountless = JSON.parse(request.cookies.get(accountlessCookieName)?.value || 'null');

        if (!(resolvedParams.publishableKey || PUBLISHABLE_KEY || accountless)) {
          accountless = await resolvedClerkClient.accountlessApplications.createAccountlessApplication();
          toWrite = accountlessCookieName;
        }
      }

      const _pk = request.cookies.get('acc-pk')?.value;
      const _sk = request.cookies.get('acc-sk')?.value;

      if (tryAccountlessFile) {
        console.log('------tryAccountlessFile');
        console.log({
          ephemeralAccount: {
            _sk,
            _pk,
          },
        });
        // accountless = JSON.parse(request.cookies.get('__clerk_tmp')?.value || 'null');
        // console.log('------accountless read', accountless);
        // let accountless = await resolvedClerkClient.accountlessApplications.read();

        if (!(resolvedParams.publishableKey || PUBLISHABLE_KEY || accountless || _sk || _pk)) {
          const res = NextResponse.next();

          setRequestHeadersOnNextResponse(res, request, {
            [constants.Headers.AuthStatus]: 'signed-out',
            'clerk-create-accountless': 'true',
            // [constants.Headers.AuthToken]: token || '',
            // [constants.Headers.AuthSignature]: token
            //   ? createTokenSignature(token, requestData?.secretKey ?? SECRET_KEY)
            //   : '',
            // [constants.Headers.AuthMessage]: message || '',
            // [constants.Headers.AuthReason]: reason || '',
            // [constants.Headers.ClerkUrl]: req.clerkUrl.toString(),
            // ...(clerkRequestData ? { [constants.Headers.ClerkRequestData]: clerkRequestData } : {}),
          });

          return res;

          // accountless = await resolvedClerkClient.accountlessApplications.createAccountlessApplication();
          // // request.cookies.set({
          // //   name: '__clerk_tmp',
          // //   value: JSON.stringify(accountless),
          // // });
          // toWrite = '__clerk_tmp';
          // console.log('------accountless new', accountless);
          // await resolvedClerkClient.accountlessApplications.store(accountless);
        }
      }

      const publishableKey = assertKey(
        resolvedParams.publishableKey || PUBLISHABLE_KEY || accountless?.publishable_key || _pk,
        () => errorThrower.throwMissingPublishableKeyError(),
      );
      const secretKey = assertKey(resolvedParams.secretKey || SECRET_KEY || accountless?.secret_key || _sk, () =>
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
      resolvedClerkClient = await clerkClient();

      resolvedClerkClient.telemetry.record(
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

      const requestState = await resolvedClerkClient.authenticateRequest(
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
        if (toWrite) {
          const res = new NextResponse(null, { status: 307, headers: requestState.headers });
          const oneYearLater = new Date();
          oneYearLater.setFullYear(new Date().getFullYear() + 1);
          res.cookies.set({
            name: toWrite,
            value: JSON.stringify(accountless),
            expires: oneYearLater,
            secure: true,
            sameSite: 'lax',
            httpOnly: true,
          });
          return res;
        }

        return new Response(null, { status: 307, headers: requestState.headers });
      } else if (requestState.status === AuthStatus.Handshake) {
        throw new Error('Clerk: handshake status without redirect');
      }

      const authObject = requestState.toAuth();
      logger.debug('auth', () => ({ auth: authObject, debug: authObject.debug() }));

      const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);
      const protect = await createMiddlewareProtect(clerkRequest, authObject, redirectToSignIn);

      const authObjWithMethods: ClerkMiddlewareAuthObject = Object.assign(authObject, { redirectToSignIn });
      const authHandler = () => Promise.resolve(authObjWithMethods);
      authHandler.protect = protect;

      let handlerResult: Response = NextResponse.next();
      try {
        const userHandlerResult = await clerkMiddlewareRequestDataStorage.run(
          clerkMiddlewareRequestDataStore,
          async () => handler?.(authHandler, request, event),
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

      function sanitizePublicData() {
        const { publishableKey, proxyUrl, signUpUrl, signInUrl, isSatellite, domain, afterSignInUrl, afterSignUpUrl } =
          options;

        return {
          publishableKey,
          proxyUrl,
          signUpUrl,
          signInUrl,
          isSatellite,
          domain,
          afterSignInUrl,
          afterSignUpUrl,
        };
      }

      decorateRequest(
        clerkRequest,
        handlerResult,
        requestState,
        { ...resolvedParams, ...options },
        sanitizePublicData(),
      );

      return handlerResult;
    });

    const nextMiddleware: NextMiddleware = async (request, event) => {
      const resolvedParams = typeof params === 'function' ? params(request) : params;
      const { tryAccountlessFile } = resolvedParams;
      if (!tryAccountlessFile) {
        return baseNextMiddleware(request, event);
      }

      const ephemeralParams = unpackEphemeralQueryParams(request);

      if (ephemeralParams) {
        const response = new NextResponse(null, {
          status: 307,
          headers: { location: `${request.nextUrl.protocol}//${request.nextUrl.host}` },
        });

        // const options = {
        //   expires: 1000000,
        // };
        //
        // response.cookies.set(constants.Cookies.EphemeralExpiresAt, ephemeralAccount.expiresAt.toString(), options);
        response.cookies.set('acc-pk', ephemeralParams.publishableKey);
        response.cookies.set('acc-sk', ephemeralParams.secretKey);

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
    const url = clerkRequest.clerkUrl.toString();
    redirectToSignInError(url, opts.returnBackUrl);
  };
};

const createMiddlewareProtect = (
  clerkRequest: ClerkRequest,
  authObject: AuthObject,
  redirectToSignIn: RedirectFun<Response>,
) => {
  return (async (params: any, options: any) => {
    const notFound = () => nextjsNotFound();

    const redirect = (url: string) =>
      nextjsRedirectError(url, {
        redirectUrl: url,
      });

    return createProtect({ request: clerkRequest, redirect, notFound, authObject, redirectToSignIn })(params, options);
  }) as unknown as Promise<AuthProtect>;
};

// Handle errors thrown by protect() and redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (e: any, clerkRequest: ClerkRequest, requestState: RequestState): Response => {
  if (isNextjsNotFoundError(e)) {
    // Rewrite to a bogus URL to force not found error
    return setHeader(
      NextResponse.rewrite(`${clerkRequest.clerkUrl.origin}/clerk_${Date.now()}`),
      constants.Headers.AuthReason,
      'protect-rewrite',
    );
  }

  if (isRedirectToSignInError(e)) {
    return createRedirect({
      redirectAdapter,
      baseUrl: clerkRequest.clerkUrl,
      signInUrl: requestState.signInUrl,
      signUpUrl: requestState.signUpUrl,
      publishableKey: requestState.publishableKey,
    }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
  }

  if (isNextjsRedirectError(e)) {
    return redirectAdapter(e.redirectUrl);
  }

  throw e;
};

export function isClerkKeyError(err: any) {
  const message = String(err);
  return (
    message.includes('Missing publishableKey') ||
    message.includes('Missing secretKey') ||
    message.includes("Clerk can't detect usage of clerkMiddleware()")
  );
}

const unpackEphemeralQueryParams = (request: NextMiddlewareRequestParam): EphemeralAccount | undefined => {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  const ephemeralParams = {
    // expiresAt: params[constants.QueryParameters.EphemeralExpiresAt],
    publishableKey: params['acc-pk'],
    secretKey: params['acc-sk'],
  };

  const maybeEphemeral = Object.fromEntries(
    Object.entries(ephemeralParams).filter(([_, v]) => v != null),
  ) as Partial<EphemeralAccount>;

  if (Object.keys(maybeEphemeral).length === Object.keys(ephemeralParams).length) {
    // @ts-ignore
    return maybeEphemeral;
  } else {
    return undefined;
  }
};

export type EphemeralAccount = {
  publishableKey: string;
  secretKey: string;
  // expiresAt: number;
};
