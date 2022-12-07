import { sanitizeAuthObject } from '../clerk';
import { invalidRootLoaderCallbackResponseReturn, invalidRootLoaderCallbackReturn } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import { LoaderFunctionArgs, LoaderFunctionReturn, RootAuthLoaderCallback, RootAuthLoaderOptions } from './types';
import {
  assertObject,
  injectAuthIntoRequest,
  interstitialJsonResponse,
  isRedirect,
  isResponse,
  returnLoaderResultJsonResponse,
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

  const requestState = await authenticateRequest(args, opts);

  if (requestState.isInterstitial) {
    throw interstitialJsonResponse(requestState, { loader: 'root' });
  }

  if (!callback) {
    return returnLoaderResultJsonResponse({ requestState });
  }

  const callbackResult = await callback(injectAuthIntoRequest(args, sanitizeAuthObject(requestState.toAuth())));
  assertObject(callbackResult, invalidRootLoaderCallbackReturn);

  // Pass through custom responses
  if (isResponse(callbackResult)) {
    if (isRedirect(callbackResult)) {
      return callbackResult;
    }
    throw new Error(invalidRootLoaderCallbackResponseReturn);
  }

  return returnLoaderResultJsonResponse({ requestState, callbackResult });
};
