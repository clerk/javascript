import { AsyncLocalStorage } from 'node:async_hooks';

import type { AuthenticateRequestOptions } from '@clerk/backend/internal';

export const clerkMiddlewareRequestDataStore = new Map<'requestData', AuthenticateRequestOptions>();
export const clerkMiddlewareRequestDataStorage = new AsyncLocalStorage<typeof clerkMiddlewareRequestDataStore>();
