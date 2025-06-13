import {
  type AuthenticateRequestOptions,
  type GetAuthFn,
  getAuthObjectForAcceptedToken,
} from '@clerk/backend/internal';
import type { LoaderFunctionArgs } from 'react-router';

import { noLoaderArgsPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { RootAuthLoaderOptions } from './types';

type GetAuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] } & Pick<
  RootAuthLoaderOptions,
  'secretKey'
>;

export const getAuth: GetAuthFn<LoaderFunctionArgs, true> = (async (
  args: LoaderFunctionArgs,
  opts?: GetAuthOptions,
) => {
  if (!args || (args && (!args.request || !args.context))) {
    throw new Error(noLoaderArgsPassedInGetAuth);
  }

  const { acceptsToken, ...restOptions } = opts || {};

  const loadedOptions = loadOptions(args, restOptions);
  // Note: authenticateRequest() will throw a redirect if the auth state is determined to be handshake
  const requestState = await authenticateRequest(args, {
    ...loadedOptions,
    acceptsToken: 'any',
  });

  const authObject = requestState.toAuth();

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken });
}) as GetAuthFn<LoaderFunctionArgs, true>;
