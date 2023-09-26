import { sanitizeAuthObject } from '@clerk/backend';

import { invalidRootLoaderCallbackReturn } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import type { LoaderFunctionArgs, LoaderFunctionReturn, RootAuthLoaderCallback, RootAuthLoaderOptions } from './types';
import {
  assertValidHandlerResult,
  injectAuthIntoRequest,
  injectRequestStateIntoResponse,
  interstitialJsonResponse,
  isRedirect,
  isResponse,
  unknownResponse,
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
 * Makes authorization state available in your application by wrapping the root loader.
 *
 * @see https://clerk.com/docs/quickstarts/remix
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

  const requestState = await authenticateRequest(args, opts);

  if (requestState.isUnknown) {
    throw unknownResponse(requestState);
  }

  if (requestState.isInterstitial) {
    throw interstitialJsonResponse(requestState, { loader: 'root' });
  }

  if (!handler) {
    // if the user did not provide a handler, simply inject requestState into an empty response
    return injectRequestStateIntoResponse(new Response(JSON.stringify({})), requestState);
  }

  const handlerResult = await handler(injectAuthIntoRequest(args, sanitizeAuthObject(requestState.toAuth())));
  assertValidHandlerResult(handlerResult, invalidRootLoaderCallbackReturn);

  if (isResponse(handlerResult)) {
    try {
      // respect and pass-through any redirects without modifying them
      if (isRedirect(handlerResult)) {
        return handlerResult;
      }
      // clone and try to inject requestState into all json-like responses
      // if this fails, the user probably didn't return a json object or a valid json string
      return injectRequestStateIntoResponse(handlerResult, requestState);
    } catch (e) {
      throw new Error(invalidRootLoaderCallbackReturn);
    }
  }

  // if the return value of the user's handler is null or a plain object, create an empty response to inject Clerk's state into
  const responseBody = JSON.stringify(handlerResult ?? {});

  return injectRequestStateIntoResponse(new Response(responseBody), requestState);
};
