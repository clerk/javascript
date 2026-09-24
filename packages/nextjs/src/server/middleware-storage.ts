import { AsyncLocalStorage } from 'node:async_hooks';

import type { AuthenticateRequestOptions } from '@clerk/backend/internal';

export type ClerkMiddlewareRequestDataStore = Map<'requestData', AuthenticateRequestOptions>;

export const clerkMiddlewareRequestDataStorage = new AsyncLocalStorage<ClerkMiddlewareRequestDataStore>();
