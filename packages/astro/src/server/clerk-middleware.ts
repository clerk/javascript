import type { AuthObject, ClerkClient } from '@clerk/backend';
import type {
  AuthenticateRequestOptions,
  AuthOptions,
  ClerkRequest,
  RedirectFun,
  RequestState,
} from '@clerk/backend/internal';
import {
  AuthStatus,
  constants,
  createClerkRequest,
  createRedirect,
  getAuthObjectForAcceptedToken,
  signedOutAuthObject,
  TokenType,
} from '@clerk/backend/internal';
import { isDevelopmentFromSecretKey } from '@clerk/shared/keys';
import { handleNetlifyCacheInDevInstance } from '@clerk/shared/netlifyCacheHandler';
import { isHttpOrHttps } from '@clerk/shared/proxy';
import { handleValueOrFn } from '@clerk/shared/utils';
import type { PendingSessionOptions } from '@clerk/types';
import type { APIContext } from 'astro';

import { authAsyncStorage } from '#async-local-storage';

import { buildClerkHotloadScript } from './build-clerk-hotload-script';
import { clerkClient } from './clerk-client';
import { createCurrentUser } from './current-user';
import { getClientSafeEnv, getSafeEnv } from './get-safe-env';
import { serverRedirectWithAuth } from './server-redirect-with-auth';
import type {
  AstroMiddleware,
  AstroMiddlewareContextParam,
  AstroMiddlewareNextParam,
  AstroMiddlewareReturn,
  AuthFn,
  SessionAuthObjectWithRedirect,
} from './types';
import { isRedirect, setHeader } from './utils';

const CONTROL_FLOW_ERROR = {
  REDIRECT_TO_SIGN_IN: 'CLERK_PROTECT_REDIRECT_TO_SIGN_IN',
};

type ClerkAstroMiddlewareHandler = (
  auth: AuthFn,
  context: AstroMiddlewareContextParam,
  next: AstroMiddlewareNextParam,
) => AstroMiddlewareReturn | undefined;

type ClerkAstroMiddlewareOptions = AuthenticateRequestOptions;

/**
 * Middleware for Astro that handles authentication and authorization with Clerk.
 */
interface ClerkMiddleware {
  /**
   * @example
   * export default clerkMiddleware((auth, context, next) => { ... }, options);
   */
  (handler: ClerkAstroMiddlewareHandler, options?: ClerkAstroMiddlewareOptions): AstroMiddleware;

  /**
   * @example
   * export default clerkMiddleware(options);
   */
  (options?: ClerkAstroMiddlewareOptions): AstroMiddleware;
}

export const clerkMiddleware: ClerkMiddleware = (...args: unknown[]): any => {
  const [handler, options] = parseHandlerAndOptions(args);

  const astroMiddleware: AstroMiddleware = async (context, next) => {
    // if the current page is prerendered, do nothing
    if (isPrerenderedPage(context)) {
      return next();
    }

    const clerkRequest = createClerkRequest(context.request);

    const requestState = await clerkClient(context).authenticateRequest(
      clerkRequest,
      createAuthenticateRequestOptions(clerkRequest, options, context),
    );

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      handleNetlifyCacheInDevInstance({
        locationHeader,
        requestStateHeaders: requestState.headers,
        publishableKey: requestState.publishableKey,
      });

      const res = new Response(null, { status: 307, headers: requestState.headers });
      return decorateResponseWithObservabilityHeaders(res, requestState);
    } else if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    const authObjectFn = (opts?: PendingSessionOptions) => requestState.toAuth(opts);

    const redirectToSignIn = createMiddlewareRedirectToSignIn(clerkRequest);

    decorateAstroLocal(clerkRequest, authObjectFn, context, requestState);

    /**
     * ALS is crucial for guaranteeing SSR in UI frameworks like React.
     * This currently powers the `useAuth()` React hook and any other hook or Component that depends on it.
     */
    const asyncStorageAuthObject =
      authObjectFn().tokenType === TokenType.SessionToken ? authObjectFn() : signedOutAuthObject({});

    const authHandler = (opts?: AuthOptions) => {
      const authObject = getAuthObjectForAcceptedToken({
        authObject: authObjectFn({ treatPendingAsSignedOut: opts?.treatPendingAsSignedOut }),
        acceptsToken: opts?.acceptsToken,
      });

      if (authObject.tokenType === TokenType.SessionToken) {
        return Object.assign(authObject, { redirectToSignIn });
      }

      return authObject;
    };

    return authAsyncStorage.run(asyncStorageAuthObject, async () => {
      /**
       * Generate SSR page
       */
      let handlerResult: Response;
      try {
        handlerResult = (await handler?.(authHandler as AuthFn, context, next)) || (await next());
      } catch (e: any) {
        handlerResult = handleControlFlowErrors(e, clerkRequest, requestState, context);
      }

      if (isRedirect(handlerResult)) {
        return serverRedirectWithAuth(context, clerkRequest, handlerResult, options);
      }

      const response = decorateRequest(context.locals, handlerResult);
      if (requestState.headers) {
        requestState.headers.forEach((value, key) => {
          response.headers.append(key, value);
        });
      }

      return response;
    });
  };

  return astroMiddleware;
};

const isPrerenderedPage = (context: APIContext) => {
  return (
    // for Astro v5
    ('isPrerendered' in context && context.isPrerendered) ||
    // for Astro v4
    ('_isPrerendered' in context && context._isPrerendered)
  );
};

// TODO-SHARED: Duplicate from '@clerk/nextjs'
const parseHandlerAndOptions = (args: unknown[]) => {
  return [
    typeof args[0] === 'function' ? args[0] : undefined,
    (args.length === 2 ? args[1] : typeof args[0] === 'function' ? {} : args[0]) || {},
  ] as [ClerkAstroMiddlewareHandler | undefined, ClerkAstroMiddlewareOptions];
};

type AuthenticateRequest = Pick<ClerkClient, 'authenticateRequest'>['authenticateRequest'];

// TODO-SHARED: Duplicate from '@clerk/nextjs'
export const createAuthenticateRequestOptions = (
  clerkRequest: ClerkRequest,
  options: ClerkAstroMiddlewareOptions,
  context: AstroMiddlewareContextParam,
): Parameters<AuthenticateRequest>[1] => {
  return {
    ...options,
    secretKey: options.secretKey || getSafeEnv(context).sk,
    publishableKey: options.publishableKey || getSafeEnv(context).pk,
    signInUrl: options.signInUrl || getSafeEnv(context).signInUrl,
    signUpUrl: options.signUpUrl || getSafeEnv(context).signUpUrl,
    ...handleMultiDomainAndProxy(clerkRequest, options, context),
    acceptsToken: 'any',
  };
};

// TODO-SHARED: Duplicate from '@clerk/nextjs'
export const decorateResponseWithObservabilityHeaders = (res: Response, requestState: RequestState): Response => {
  if (requestState.message) {
    res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  }
  if (requestState.reason) {
    res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  }
  if (requestState.status) {
    res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
  }
  return res;
};

// TODO-SHARED: Duplicate from '@clerk/nextjs'
export const handleMultiDomainAndProxy = (
  clerkRequest: ClerkRequest,
  opts: AuthenticateRequestOptions,
  context: AstroMiddlewareContextParam,
) => {
  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    opts?.proxyUrl,
    clerkRequest.clerkUrl,
    getSafeEnv(context).proxyUrl,
  );

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, clerkRequest.clerkUrl).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const isSatellite = handleValueOrFn(opts.isSatellite, new URL(clerkRequest.url), getSafeEnv(context).isSatellite);
  const domain = handleValueOrFn(opts.domain, new URL(clerkRequest.url), getSafeEnv(context).domain);
  const signInUrl = opts?.signInUrl || getSafeEnv(context).signInUrl;

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(missingDomainAndProxy);
  }

  if (
    isSatellite &&
    !isHttpOrHttps(signInUrl) &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    isDevelopmentFromSecretKey(opts.secretKey || getSafeEnv(context).sk!)
  ) {
    throw new Error(missingSignInUrlInDev);
  }

  return {
    proxyUrl,
    isSatellite,
    domain,
  };
};

export const missingDomainAndProxy = `
Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl.

1) With middleware
   e.g. export default clerkMiddleware({domain:'YOUR_DOMAIN',isSatellite:true});
2) With environment variables e.g.
   PUBLIC_CLERK_DOMAIN='YOUR_DOMAIN'
   PUBLIC_CLERK_IS_SATELLITE='true'
   `;

export const missingSignInUrlInDev = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL

1) With middleware
   e.g. export default clerkMiddleware({signInUrl:'SOME_URL', isSatellite:true});
2) With environment variables e.g.
   PUBLIC_CLERK_SIGN_IN_URL='SOME_URL'
   PUBLIC_CLERK_IS_SATELLITE='true'`;

function decorateAstroLocal(
  clerkRequest: ClerkRequest,
  authObjectFn: (opts?: PendingSessionOptions) => AuthObject,
  context: APIContext,
  requestState: RequestState,
) {
  const { reason, message, status, token } = requestState;
  context.locals.authToken = token;
  context.locals.authStatus = status;
  context.locals.authMessage = message;
  context.locals.authReason = reason;
  context.locals.auth = (({ acceptsToken, treatPendingAsSignedOut }: AuthOptions = {}) => {
    const authObject = getAuthObjectForAcceptedToken({
      authObject: authObjectFn({ treatPendingAsSignedOut }),
      acceptsToken,
    });

    if (authObject.tokenType === TokenType.SessionToken) {
      const clerkUrl = clerkRequest.clerkUrl;

      const redirectToSignIn: RedirectFun<Response> = (opts = {}) => {
        const devBrowserToken =
          clerkRequest.clerkUrl.searchParams.get(constants.QueryParameters.DevBrowser) ||
          clerkRequest.cookies.get(constants.Cookies.DevBrowser);

        return createRedirect({
          redirectAdapter,
          devBrowserToken: devBrowserToken,
          baseUrl: clerkUrl.toString(),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          publishableKey: getSafeEnv(context).pk!,
          signInUrl: requestState.signInUrl,
          signUpUrl: requestState.signUpUrl,
          sessionStatus: requestState.toAuth()?.sessionStatus,
        }).redirectToSignIn({
          returnBackUrl: opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkUrl.toString(),
        });
      };

      return Object.assign(authObject, { redirectToSignIn });
    }

    return authObject;
  }) as AuthFn;

  context.locals.currentUser = createCurrentUser(context);
}

/**
 * Find the index of the closing head tag in the chunk.
 *
 * Note: This implementation uses a simple approach that works for most of our
 * current use cases.
 */
function findClosingHeadTagIndex(chunk: Uint8Array, endHeadTag: Uint8Array) {
  return chunk.findIndex((_, i) => endHeadTag.every((value, j) => value === chunk[i + j]));
}

function decorateRequest(locals: APIContext['locals'], res: Response): Response {
  /**
   * Populate every page with the authObject. This allows for SSR to work properly
   * without sucrificing DX and having developers wrap each page with a Layout that would handle this.
   */
  if (res.headers.get('content-type') === 'text/html') {
    const encoder = new TextEncoder();
    const closingHeadTag = encoder.encode('</head>');
    const clerkAstroData = encoder.encode(
      `<script id="__CLERK_ASTRO_DATA__" type="application/json">${JSON.stringify(locals.auth())}</script>\n`,
    );
    const clerkSafeEnvVariables = encoder.encode(
      `<script id="__CLERK_ASTRO_SAFE_VARS__" type="application/json">${JSON.stringify(getClientSafeEnv(locals))}</script>\n`,
    );
    const hotloadScript = encoder.encode(buildClerkHotloadScript(locals));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const stream = res.body!.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          const index = findClosingHeadTagIndex(chunk, closingHeadTag);
          const isClosingHeadTagFound = index !== -1;

          /**
           * Hijack html response to position `__CLERK_ASTRO_DATA__` before the closing `head` html tag
           */
          if (isClosingHeadTagFound) {
            controller.enqueue(chunk.slice(0, index));
            controller.enqueue(clerkAstroData);
            controller.enqueue(clerkSafeEnvVariables);

            controller.enqueue(hotloadScript);

            controller.enqueue(closingHeadTag);
            controller.enqueue(chunk.slice(index + closingHeadTag.length));
          } else {
            controller.enqueue(chunk);
          }
        },
      }),
    );

    const modifiedResponse = new Response(stream, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });

    return modifiedResponse;
  }
  return res;
}

const redirectAdapter = (url: string | URL) => {
  const res = new Response(null, {
    status: 307,
  });

  /**
   * Hint to clerk to add cookie with db jwt
   */
  setHeader(res, constants.Headers.ClerkRedirectTo, 'true');
  return setHeader(res, 'Location', url instanceof URL ? url.href : url);
};

const createMiddlewareRedirectToSignIn = (
  clerkRequest: ClerkRequest,
): SessionAuthObjectWithRedirect['redirectToSignIn'] => {
  return (opts = {}) => {
    const err = new Error(CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN) as any;
    err.returnBackUrl = opts.returnBackUrl === null ? '' : opts.returnBackUrl || clerkRequest.clerkUrl.toString();
    throw err;
  };
};

// Handle errors thrown by redirectToSignIn() calls,
// as we want to align the APIs between middleware, pages and route handlers
// Normally, middleware requires to explicitly return a response, but we want to
// avoid discrepancies between the APIs as it's easy to miss the `return` statement
// especially when copy-pasting code from one place to another.
// This function handles the known errors thrown by the APIs described above,
// and returns the appropriate response.
const handleControlFlowErrors = (
  e: any,
  clerkRequest: ClerkRequest,
  requestState: RequestState,
  context: AstroMiddlewareContextParam,
): Response => {
  switch (e.message) {
    case CONTROL_FLOW_ERROR.REDIRECT_TO_SIGN_IN:
      return createRedirect({
        redirectAdapter,
        baseUrl: clerkRequest.clerkUrl,
        signInUrl: requestState.signInUrl,
        signUpUrl: requestState.signUpUrl,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        publishableKey: getSafeEnv(context).pk!,
        sessionStatus: requestState.toAuth()?.sessionStatus,
      }).redirectToSignIn({ returnBackUrl: e.returnBackUrl });
    default:
      throw e;
  }
};
