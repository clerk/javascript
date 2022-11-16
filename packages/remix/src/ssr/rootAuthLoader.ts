import { invalidRootLoaderCallbackResponseReturn, invalidRootLoaderCallbackReturn } from '../errors';
import { assertFrontendApi, getEnvVariable } from '../utils';
import { getAuthState } from './getAuthState';
import { LoaderFunctionArgs, LoaderFunctionReturn, RootAuthLoaderCallback, RootAuthLoaderOptions } from './types';
import {
  assertObject,
  injectAuthIntoRequest,
  isRedirect,
  isResponse,
  returnLoaderResultJsonResponse,
  sanitizeAuthData,
  throwInterstitialJsonResponse,
} from './utils';

interface RootAuthLoader {
  <Options extends RootAuthLoaderOptions>(
    args: LoaderFunctionArgs,
    callback: RootAuthLoaderCallback<Options>,
    options?: Options,
  ): Promise<LoaderFunctionReturn>;
  (args: LoaderFunctionArgs, options?: RootAuthLoaderOptions): Promise<LoaderFunctionReturn>;
}

export const rootAuthLoader: RootAuthLoader = async (
  args: LoaderFunctionArgs,
  cbOrOptions: any,
  options?: any,
): Promise<LoaderFunctionReturn> => {
  const callback = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts: RootAuthLoaderOptions = options
    ? options
    : !!cbOrOptions && typeof cbOrOptions !== 'function'
    ? cbOrOptions
    : {};

  const frontendApi = getEnvVariable('CLERK_FRONTEND_API') || opts.frontendApi;
  assertFrontendApi(frontendApi);

  const authState = await getAuthState(args.request, opts);

  if (authState.isInterstitial) {
    throw throwInterstitialJsonResponse({ frontendApi, errorReason: authState.reason });
  }

  if (!callback) {
    return returnLoaderResultJsonResponse({ authState, frontendApi });
  }

  const callbackResult = await callback(injectAuthIntoRequest(args, sanitizeAuthData(authState)));
  assertObject(callbackResult, invalidRootLoaderCallbackReturn);

  // Pass through custom responses
  if (isResponse(callbackResult)) {
    if (isRedirect(callbackResult)) {
      return callbackResult;
    }
    throw new Error(invalidRootLoaderCallbackResponseReturn);
  }

  return returnLoaderResultJsonResponse({ authState, frontendApi, callbackResult });
};
