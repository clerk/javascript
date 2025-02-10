import { decorateObjectWithResources } from '@clerk/backend/internal';

import { invalidRootLoaderCallbackReturn } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderFunctionArgs, LoaderFunctionReturn, RootAuthLoaderCallback, RootAuthLoaderOptions } from './types';
import {
  assertValidHandlerResult,
  injectRequestStateIntoResponse,
  isDataWithResponseInit,
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
 * Makes authorization state available in your application by wrapping the root loader.
 *
 * @see https://clerk.com/docs/quickstarts/react-router
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

  const loadedOptions = loadOptions(args, opts);
  // Note: authenticateRequest() will throw a redirect if the auth state is determined to be handshake
  const _requestState = await authenticateRequest(args, loadedOptions);
  // TODO: Investigate if `authenticateRequest` needs to return the loadedOptions (the new request urls in particular)
  const requestState = { ...loadedOptions, ..._requestState };

  if (!handler) {
    // if the user did not provide a handler, simply inject requestState into an empty response
    return injectRequestStateIntoResponse(new Response(JSON.stringify({})), requestState, args.context);
  }

  const authObj = requestState.toAuth();
  const requestWithAuth = Object.assign(args.request, { auth: authObj });
  await decorateObjectWithResources(requestWithAuth, authObj, loadedOptions);
  const handlerResult = await handler(args);
  assertValidHandlerResult(handlerResult, invalidRootLoaderCallbackReturn);

  if (isResponse(handlerResult)) {
    try {
      // respect and pass-through any redirects without modifying them
      if (isRedirect(handlerResult)) {
        return handlerResult;
      }
      // clone and try to inject requestState into all json-like responses
      // if this fails, the user probably didn't return a json object or a valid json string
      return injectRequestStateIntoResponse(handlerResult, requestState, args.context);
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
      );
    } catch {
      throw new Error(invalidRootLoaderCallbackReturn);
    }
  }

  // if the return value of the user's handler is null or a plain object, create an empty response to inject Clerk's state into
  const responseBody = JSON.stringify(handlerResult ?? {});

  return injectRequestStateIntoResponse(new Response(responseBody), requestState, args.context);
};
