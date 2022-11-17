import { json } from '@remix-run/server-runtime';

import { getAuthInterstitialErrorRendered, noLoaderArgsPassedInGetAuth } from '../errors';
import { getAuthState } from './getAuthState';
import { GetAuthReturn, LoaderFunctionArgs } from './types';
import { sanitizeAuthData } from './utils';

const EMPTY_INTERSTITIAL_RESPONSE = { message: getAuthInterstitialErrorRendered };

export async function getAuth(args: LoaderFunctionArgs): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const authState = await getAuthState(args);

  if (authState.isInterstitial || !authState) {
    throw json(EMPTY_INTERSTITIAL_RESPONSE, { status: 401 });
  }

  return sanitizeAuthData(authState);
}
