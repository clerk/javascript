import { sanitizeAuthObject } from '../clerk';
import { noLoaderArgsPassedInGetAuth } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { interstitialJsonResponse } from './utils';

export async function getAuth(args: LoaderFunctionArgs): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const requestState = await authenticateRequest(args);

  if (requestState.isInterstitial || !requestState) {
    throw interstitialJsonResponse(requestState, { loader: 'nested' });
  }

  return sanitizeAuthObject(requestState.toAuth());
}
