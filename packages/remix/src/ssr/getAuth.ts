import { sanitizeAuthObject } from '@clerk/backend/internal';

import { noLoaderArgsPassedInGetAuth } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import type { GetAuthReturn, LoaderFunctionArgs, RootAuthLoaderOptions } from './types';

type GetAuthOptions = Pick<RootAuthLoaderOptions, 'secretKey'>;

export async function getAuth(args: LoaderFunctionArgs, opts?: GetAuthOptions): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const requestState = await authenticateRequest(args, opts);

  return sanitizeAuthObject(requestState.toAuth());
}
