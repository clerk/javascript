import type { ClerkState } from 'src/client/types.js';

import { authenticateRequest } from './authenticateRequest.js';
import { loadOptions } from './loadOptions.js';
import { getResponseClerkState } from './utils/utils.js';

declare module '@tanstack/react-router' {
  interface AnyContext {
    clerkState: ClerkState;
  }
}

export const rootAuthBeforeLoader = async (request: Request) => {
  const loadedOptions = loadOptions(request);

  const requestState = await authenticateRequest(request, loadedOptions);

  return getResponseClerkState(requestState);
};
