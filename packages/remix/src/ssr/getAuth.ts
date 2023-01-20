import { sanitizeAuthObject } from '@clerk/backend';

import { noLoaderArgsPassedInGetAuth } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import { GetAuthReturn, LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { interstitialJsonResponse } from './utils';

type GetAuthOptions = Pick<RootAuthLoaderOptions, 'apiKey' | 'secretKey'>;

export async function getAuth(args: LoaderFunctionArgs, opts?: GetAuthOptions): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const requestState = await authenticateRequest(args, opts);

  if (requestState.isInterstitial || requestState.isUnknown) {
    throw interstitialJsonResponse(requestState, { loader: 'nested' });
  }

  return sanitizeAuthObject(requestState.toAuth());
}
