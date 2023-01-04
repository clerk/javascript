import { sanitizeAuthObject } from '@clerk/backend';

import { noLoaderArgsPassedInGetAuth } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { interstitialJsonResponse } from './utils';

export async function getAuth(argsOrReq: Request | LoaderFunctionArgs, opts?: any): GetAuthReturn {
  const args = 'request' in argsOrReq ? { ...argsOrReq } : { request: argsOrReq, context: {}, params: {} };

  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const requestState = await authenticateRequest(args, opts);

  if (requestState.isInterstitial || !requestState) {
    throw interstitialJsonResponse(requestState, { loader: 'nested' });
  }

  return sanitizeAuthObject(requestState.toAuth());
}
