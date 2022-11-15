import { invalidRootLoaderCallbackResponseReturn, invalidRootLoaderCallbackReturn } from '../errors';
import { errorThrower } from '../errorThrower';
import { getAuthData } from './getAuthData';
import { LoaderFunctionArgs, LoaderFunctionReturn, RootAuthLoaderCallback, RootAuthLoaderOptions } from './types';
import {
  assertObject,
  injectAuthIntoRequest,
  interstitialJsonResponse,
  isRedirect,
  isResponse,
  returnLoaderResultJsonResponse,
  sanitizeAuthData,
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

  const frontendApi = process.env.CLERK_FRONTEND_API || opts.frontendApi || '';
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY || opts.publishableKey || '';

  if (!frontendApi && !publishableKey) {
    errorThrower.throwMissingFrontendApiPublishableKeyError();
  }

  const { authData, showInterstitial, errorReason } = await getAuthData(args.request, opts);

  if (showInterstitial) {
    throw interstitialJsonResponse({ frontendApi, publishableKey, errorReason, loader: 'root' });
  }

  if (!callback) {
    return returnLoaderResultJsonResponse({ authData, frontendApi, publishableKey, errorReason });
  }

  const callbackResult = await callback(injectAuthIntoRequest(args, sanitizeAuthData(authData!)));
  assertObject(callbackResult, invalidRootLoaderCallbackReturn);

  // Pass through custom responses
  if (isResponse(callbackResult)) {
    if (isRedirect(callbackResult)) {
      return callbackResult;
    }
    throw new Error(invalidRootLoaderCallbackResponseReturn);
  }

  return returnLoaderResultJsonResponse({ authData, frontendApi, publishableKey, errorReason, callbackResult });
};
