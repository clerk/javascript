import { json } from '@remix-run/server-runtime';

import { getAuthInterstitialErrorRendered, noRequestPassedInGetAuth } from '../errors';
import { getAuthData } from './getAuthData';
import { GetAuthReturn, LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { sanitizeAuthData } from './utils';

const EMPTY_INTERSTITIAL_RESPONSE = { message: getAuthInterstitialErrorRendered };

export async function getAuth(
  argsOrReq: Request | LoaderFunctionArgs,
  _options?: RootAuthLoaderOptions,
): GetAuthReturn {
  if (!argsOrReq) {
    throw new Error(noRequestPassedInGetAuth);
  }
  const request = 'request' in argsOrReq ? argsOrReq.request : argsOrReq;
  const options =
    'context' in argsOrReq && 'requestId' in argsOrReq.context
      ? { ..._options, requestId: argsOrReq.context.requestId }
      : _options;
  const { authData, showInterstitial } = await getAuthData(request, options);

  if (showInterstitial || !authData) {
    throw json(EMPTY_INTERSTITIAL_RESPONSE, { status: 401 });
  }

  return sanitizeAuthData(authData);
}
