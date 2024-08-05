import type { AuthObject } from '@clerk/backend/internal';
import { stripPrivateDataFromObject } from '@clerk/backend/internal';
import type { FetchFnCtx } from '@tanstack/start';

import { noFetchFnCtxPassedInGetAuth } from '../utils/errors';
import { authenticateRequest } from './authenticateRequest';
import { loadOptions } from './loadOptions';

export type GetAuthReturn = Promise<AuthObject>;

export async function getAuth(ctx: FetchFnCtx): GetAuthReturn {
  if (!ctx || (ctx && !ctx.request)) {
    throw new Error(noFetchFnCtxPassedInGetAuth);
  }

  const loadedOptions = loadOptions(ctx.request);

  const requestState = await authenticateRequest(ctx.request, loadedOptions);

  return stripPrivateDataFromObject(requestState.toAuth());
}
