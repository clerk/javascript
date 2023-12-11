import { AuthStatus, sanitizeAuthObject } from '@clerk/backend';
import { redirect } from '@remix-run/server-runtime';

import { noLoaderArgsPassedInGetAuth } from '../errors';
import { authenticateRequest } from './authenticateRequest';
import type { GetAuthReturn, LoaderFunctionArgs, RootAuthLoaderOptions } from './types';

type GetAuthOptions = Pick<RootAuthLoaderOptions, 'secretKey'>;

export async function getAuth(args: LoaderFunctionArgs, opts?: GetAuthOptions): GetAuthReturn {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }
  const requestState = await authenticateRequest(args, opts);

  // TODO handle handshake
  // this halts the execution of all nested loaders using getAuth
  if (requestState.status === AuthStatus.Handshake) {
    throw redirect('');
  }

  return sanitizeAuthObject(requestState.toAuth());
}
