import type { AuthObject } from '@clerk/backend/internal';
import { stripPrivateDataFromObject } from '@clerk/backend/internal';
import type { FetchFnCtx } from '@tanstack/start';

import { noFetchFnCtxPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';

export type GetAuthReturn = Promise<AuthObject>;

type GetAuthOptions = Pick<LoaderOptions, 'secretKey'>;

export async function getAuth(ctx: FetchFnCtx, opts?: GetAuthOptions): GetAuthReturn {
  if (!ctx || (ctx && !ctx.request)) {
    throw new Error(noFetchFnCtxPassedInGetAuth);
  }

  const loadedOptions = loadOptions(ctx.request, opts);

  const requestState = await authenticateRequest(ctx.request, loadedOptions);

  return stripPrivateDataFromObject(requestState.toAuth());
}
