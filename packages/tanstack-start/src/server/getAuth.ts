import type { AuthObject } from '@clerk/backend';
import { stripPrivateDataFromObject } from '@clerk/backend/internal';
import type { FetchFnCtx } from '@tanstack/start';

import { errorThrower } from '../utils';
import { noFetchFnCtxPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';
import type { LoaderOptions } from './types';

type GetAuthReturn = Promise<AuthObject>;

type GetAuthOptions = Pick<LoaderOptions, 'secretKey'>;

export async function getAuth(ctx: FetchFnCtx, opts?: GetAuthOptions): GetAuthReturn {
  if (!ctx || (ctx && !ctx.request)) {
    errorThrower.throw(noFetchFnCtxPassedInGetAuth);
  }

  const loadedOptions = loadOptions(ctx.request, opts);

  const requestState = await authenticateRequest(ctx.request, loadedOptions);

  return stripPrivateDataFromObject(requestState.toAuth());
}
