import { noRequestPassedInGetAuth } from '../errors';
import { getAuthData } from './getAuthData';
import { GetAuthOptions, GetAuthReturn, LoaderFunctionArgs } from './types';
import { sanitizeAuthData } from './utils';

export async function getAuth<Options extends GetAuthOptions>(
  argsOrReq: Request | LoaderFunctionArgs,
  options?: Options,
): GetAuthReturn<Options> {
  if (!argsOrReq) {
    throw new Error(noRequestPassedInGetAuth);
  }

  const request = 'request' in argsOrReq ? argsOrReq.request : argsOrReq;
  const { authData } = await getAuthData(request, options || {});
  // @ts-expect-error This can only return null during interstitial,
  // but the public types should not know that
  return sanitizeAuthData(authData || {});
}
