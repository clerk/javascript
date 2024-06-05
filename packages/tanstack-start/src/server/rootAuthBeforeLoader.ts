'use server';
import type { FileBaseRouteOptions } from '@tanstack/react-router';
import type { ClerkState } from 'src/client/types.js';
import { getWebRequest } from 'vinxi/http';

import { authenticateRequest } from './authenticateRequest.js';
import { loadOptions } from './loadOptions.js';

declare module '@tanstack/react-router' {
  interface AnyContext {
    clerkState: ClerkState;
  }
}

type NonNullable<T> = Exclude<T, null | undefined>;

type RootAuthBeforeLoaderOptions = Parameters<NonNullable<FileBaseRouteOptions['beforeLoad']>>[0];

export const rootAuthBeforeLoader = async ({ context }: RootAuthBeforeLoaderOptions) => {
  const request = getWebRequest();

  const loadedOptions = loadOptions(request);

  const requestState = await authenticateRequest(request, loadedOptions);

  const mergedContext = {
    ...context,
    clerkStateContext: requestState,
  };
  return mergedContext;
};
