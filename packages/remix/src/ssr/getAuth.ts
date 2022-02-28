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
  const { authData, interstitial } = await getAuthData(request);

  if (interstitial) {
    throw json(EMPTY_INTERSTITIAL_RESPONSE);
  }

  // @ts-expect-error This can only return null during interstitial,
  // but the public types should not know that
  return sanitizeAuthData(authData || {});
}
