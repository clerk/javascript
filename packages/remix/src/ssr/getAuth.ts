import { noRequestPassedInGetAuth } from '../errors';
import { getAuthData } from './getAuthData';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { sanitizeAuthData } from './utils';

export async function getAuth(argsOrReq: Request | LoaderFunctionArgs): GetAuthReturn {
  if (!argsOrReq) {
    throw new Error(noRequestPassedInGetAuth);
  }

  const request = 'request' in argsOrReq ? argsOrReq.request : argsOrReq;
  const { authData } = await getAuthData(request);
  // @ts-expect-error This can only return null during interstitial,
  // but the public types should not know that
  return sanitizeAuthData(authData || {});
}
