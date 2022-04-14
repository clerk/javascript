import { json } from '@remix-run/server-runtime';

import { getAuthInterstitialErrorRendered, noRequestPassedInGetAuth } from '../errors';
import { getAuthData } from './getAuthData';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { sanitizeAuthData } from './utils';

const EMPTY_INTERSTITIAL_RESPONSE = { message: getAuthInterstitialErrorRendered };

export async function getAuth(argsOrReq: Request | LoaderFunctionArgs): GetAuthReturn {
  if (!argsOrReq) {
    throw new Error(noRequestPassedInGetAuth);
  }
  const request = 'request' in argsOrReq ? argsOrReq.request : argsOrReq;
  const { authData, showInterstitial } = await getAuthData(request);

  if (showInterstitial || !authData) {
    throw json(EMPTY_INTERSTITIAL_RESPONSE, { status: 401 });
  }

  return sanitizeAuthData(authData);
}
