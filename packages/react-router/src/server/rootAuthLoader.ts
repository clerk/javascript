import type { RequestState } from '@clerk/backend/internal';
import { decorateObjectWithResources } from '@clerk/backend/internal';
import { logger } from '@clerk/shared/logger';
import type { LoaderFunctionArgs } from 'react-router';

import { invalidRootLoaderCallbackReturn, middlewareMigrationWarning } from '../utils/errors';
import { authFnContext, requestStateContext } from './clerkMiddleware';
import { legacyAuthenticateRequest } from './legacyAuthenticateRequest';
import { loadOptions } from './loadOptions';
import type {
  LoaderFunctionArgsWithAuth,
  LoaderFunctionReturn,
  RootAuthLoaderCallback,
  RootAuthLoaderOptions,
} from './types';
import {
  getResponseClerkState,
  injectRequestStateIntoResponse,
  isDataWithResponseInit,
  IsOptIntoMiddleware,
  isRedirect,
  isResponse,
} from './utils';

interface RootAuthLoader {
  <Options extends RootAuthLoaderOptions, Callback extends RootAuthLoaderCallback<Options>>(
    /**
     * Arguments passed to the loader function.
     */
    args: LoaderFunctionArgs,
    /**
     * A loader function with authentication state made available to it. Allows you to fetch route data based on the user's authentication state.
     */
    callback: Callback,
    options?: Options,
  ): Promise<ReturnType<Callback>>;

  (args: LoaderFunctionArgs, options?: RootAuthLoaderOptions): Promise<LoaderFunctionReturn>;
}

/**
 * Shared logic for processing the root auth loader with a given request state
 */
async function processRootAuthLoader(
  args: LoaderFunctionArgs,
  requestState: RequestState,
  handler?: RootAuthLoaderCallback<any>,
): Promise<LoaderFunctionReturn> {
  const hasMiddleware = IsOptIntoMiddleware(args.context) && !!args.context.get(authFnContext);
  const includeClerkHeaders = !hasMiddleware;

  if (!handler) {
    // if the user did not provide a handler, simply inject requestState into an empty response
    const { clerkState } = getResponseClerkState(requestState, args.context);
    return {
      ...clerkState,
    };
  }

  // Create args that has the auth object in the request for backward compatibility
  const argsWithAuth = {
    ...args,
    request: Object.assign(args.request, { auth: requestState.toAuth() }),
  } as LoaderFunctionArgsWithAuth<any>;

  const handlerResult = await handler(argsWithAuth);

  if (isResponse(handlerResult)) {
    try {
      // respect and pass-through any redirects without modifying them
      if (isRedirect(handlerResult)) {
        return handlerResult;
      }
      // clone and try to inject requestState into all json-like responses
      // if this fails, the user probably didn't return a json object or a valid json string
      return injectRequestStateIntoResponse(handlerResult, requestState, args.context, includeClerkHeaders);
    } catch {
      throw new Error(invalidRootLoaderCallbackReturn);
    }
  }

  if (isDataWithResponseInit(handlerResult)) {
    try {
      // clone and try to inject requestState into all json-like responses
      // if this fails, the user probably didn't return a json object or a valid json string
      return injectRequestStateIntoResponse(
        new Response(JSON.stringify(handlerResult.data), handlerResult.init ?? undefined),
        requestState,
        args.context,
        includeClerkHeaders,
      );
    } catch {
      throw new Error(invalidRootLoaderCallbackReturn);
    }
  }

  // If the return value of the user's handler is null or a plain object
  if (includeClerkHeaders) {
    // Legacy path: return Response with headers
    const responseBody = JSON.stringify(handlerResult ?? {});
    return injectRequestStateIntoResponse(new Response(responseBody), requestState, args.context, includeClerkHeaders);
  }

  // Middleware path: return plain object with streaming support
  const { clerkState } = getResponseClerkState(requestState, args.context);

  return {
    ...(handlerResult ?? {}),
    ...clerkState,
  };
}

/**
 * Makes authorization state available in your application by wrapping the root loader.
 *
 * @see https://clerk.com/docs/references/react-router/root-auth-loader
 */
export const rootAuthLoader: RootAuthLoader = async (
  args: LoaderFunctionArgs,
  handlerOrOptions: any,
  options?: any,
): Promise<LoaderFunctionReturn> => {
  const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : undefined;
  const opts: RootAuthLoaderOptions = options
    ? options
    : !!handlerOrOptions && typeof handlerOrOptions !== 'function'
      ? handlerOrOptions
      : {};

  const hasMiddlewareFlag = IsOptIntoMiddleware(args.context);
  const requestState = hasMiddlewareFlag && args.context.get(requestStateContext);

  if (!requestState) {
    logger.warnOnce(middlewareMigrationWarning);
    return legacyRootAuthLoader(args, handlerOrOptions, opts);
  }

  return processRootAuthLoader(args, requestState, handler);
};

/**
 * Legacy implementation that authenticates requests without middleware.
 * This maintains backward compatibility for users who haven't migrated to the new middleware system.
 */
const legacyRootAuthLoader: RootAuthLoader = async (
  args: LoaderFunctionArgs,
  handlerOrOptions: any,
  options?: any,
): Promise<LoaderFunctionReturn> => {
  const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : undefined;
  const opts: RootAuthLoaderOptions = options
    ? options
    : !!handlerOrOptions && typeof handlerOrOptions !== 'function'
      ? handlerOrOptions
      : {};

  const loadedOptions = loadOptions(args, opts);
  // Note: legacyAuthenticateRequest() will throw a redirect if the auth state is determined to be handshake
  const _requestState = await legacyAuthenticateRequest(args, loadedOptions);
  const requestState = { ...loadedOptions, ..._requestState };

  if (!handler) {
    // if the user did not provide a handler, simply inject requestState into an empty response
    return injectRequestStateIntoResponse(new Response(JSON.stringify({})), requestState, args.context, true);
  }

  const authObj = requestState.toAuth();
  const requestWithAuth = Object.assign(args.request, { auth: authObj });
  await decorateObjectWithResources(requestWithAuth, authObj, loadedOptions);

  return processRootAuthLoader(args, requestState, handler);
};
