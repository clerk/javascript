import { noLoaderArgsPassedInGetAuth } from '../errors';
import { getAuthState } from './getAuthState';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { interstitialJsonResponse, sanitizeAuthData } from './utils';

export async function getAuth(args: LoaderFunctionArgs): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const authState = await getAuthState(args);

  if (authState.isInterstitial || !authState) {
    throw interstitialJsonResponse(authState, { loader: 'nested' });
  }

  return sanitizeAuthData(authState);
}
