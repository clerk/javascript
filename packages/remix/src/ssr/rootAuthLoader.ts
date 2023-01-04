import { sanitizeAuthObject } from '@clerk/backend';

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
    argsOrReq: Request | LoaderFunctionArgs,
    callback: RootAuthLoaderCallback<Options>,
    options?: Options,
  ): Promise<LoaderFunctionReturn>;
  (argsOrReq: Request | LoaderFunctionArgs, options?: RootAuthLoaderOptions): Promise<LoaderFunctionReturn>;
}

export const rootAuthLoader: RootAuthLoader = async (
  argsOrReq: Request | LoaderFunctionArgs,
  cbOrOptions: any,
  options?: any,
): Promise<LoaderFunctionReturn> => {
  const args = 'request' in argsOrReq ? { ...argsOrReq } : { request: argsOrReq, context: {}, params: {} };
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
