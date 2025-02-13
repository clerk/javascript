import { stripPrivateDataFromObject } from '@clerk/backend/internal';

import { noLoaderArgsPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { GetAuthReturn, LoaderFunctionArgs, RootAuthLoaderOptions } from './types';

type GetAuthOptions = Pick<RootAuthLoaderOptions, 'secretKey'>;

export async function getAuth(args: LoaderFunctionArgs, opts?: GetAuthOptions): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }

  const loadedOptions = loadOptions(args, opts);
  // Note: authenticateRequest() will throw a redirect if the auth state is determined to be handshake
  const requestState = await authenticateRequest(args, { ...loadedOptions, entity: 'any' });

  return stripPrivateDataFromObject(requestState.toAuth());
}
