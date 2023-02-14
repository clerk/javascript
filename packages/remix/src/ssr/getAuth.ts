import { sanitizeAuthObject } from '@clerk/backend';

import { noLoaderArgsPassedInGetAuth } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import type { GetAuthReturn, LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { interstitialJsonResponse, unknownResponse } from './utils';

type GetAuthOptions = Pick<RootAuthLoaderOptions, 'apiKey' | 'secretKey'>;

export async function getAuth(args: LoaderFunctionArgs, opts?: GetAuthOptions): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const requestState = await authenticateRequest(args, opts);

  if (requestState.isUnknown) {
    throw unknownResponse(requestState);
  }

  if (requestState.isInterstitial) {
    throw interstitialJsonResponse(requestState, { loader: 'nested' });
  }

  return sanitizeAuthObject(requestState.toAuth());
}
