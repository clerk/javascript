import { json } from '@remix-run/server-runtime';

import { invalidRootLoaderCallbackResponseReturn, invalidRootLoaderCallbackReturn } from '../errors';
import { getAuthData } from './getAuthData';
import { LoaderFunctionArgs, LoaderFunctionReturn, RootAuthLoaderCallback, RootAuthLoaderOptions } from './types';
import { assertObject, injectAuthIntoArgs, isResponse, sanitizeAuthData, wrapClerkState } from './utils';

export async function rootAuthLoader<Options extends RootAuthLoaderOptions>(
  args: LoaderFunctionArgs,
  callback: RootAuthLoaderCallback<Options>,
  options?: Options,
): Promise<LoaderFunctionReturn>;
export async function rootAuthLoader(
  args: LoaderFunctionArgs,
  options?: RootAuthLoaderOptions,
): Promise<LoaderFunctionReturn>;
export async function rootAuthLoader(
  args: LoaderFunctionArgs,
  cbOrOptions: any,
  options?: any,
): Promise<LoaderFunctionReturn> {
  const callback = typeof cbOrOptions === 'function' ? cbOrOptions : undefined;
  const opts: RootAuthLoaderOptions = options
    ? options
    : !!cbOrOptions && typeof cbOrOptions !== 'function'
    ? cbOrOptions
    : {};

  const frontendApi = process.env.CLERK_FRONTEND_API || opts.frontendApi;

  const { authData, interstitial } = await getAuthData(args.request, opts);

  if (interstitial) {
    throw json(wrapClerkState({ __clerk_ssr_interstitial: interstitial }));
  }

  if (!callback) {
    return { ...wrapClerkState({ __clerk_ssr_state: authData, __frontendApi: frontendApi }) };
  }

  const callbackResult = await callback?.(injectAuthIntoArgs(args, sanitizeAuthData(authData!)));
  assertObject(callbackResult, invalidRootLoaderCallbackReturn);

  // Pass through custom responses
  if (isResponse(callbackResult)) {
    if (callbackResult.status >= 300 && callbackResult.status < 400) {
      return callbackResult;
    }
    throw new Error(invalidRootLoaderCallbackResponseReturn);
  }

  return { ...callbackResult, ...wrapClerkState({ __clerk_ssr_state: authData, __frontendApi: frontendApi }) };
}
