import { noRequestPassedInGetAuth } from '../errors';
import { getAuthData } from './getAuthData';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { interstitialJsonResponse, sanitizeAuthData } from './utils';

export async function getAuth(argsOrReq: Request | LoaderFunctionArgs, opts?: any): GetAuthReturn {
  if (!argsOrReq) {
    throw new Error(noRequestPassedInGetAuth);
  }
  const request = 'request' in argsOrReq ? argsOrReq.request : argsOrReq;
  const { authData, showInterstitial, errorReason } = await getAuthData(request);

  if (showInterstitial || !authData) {
    const frontendApi = process.env.CLERK_FRONTEND_API || opts.frontendApi;
    throw interstitialJsonResponse({ frontendApi, errorReason, loader: 'nested' });
  }

  return sanitizeAuthData(authData);
}
