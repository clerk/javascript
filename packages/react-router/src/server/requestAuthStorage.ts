import { AsyncLocalStorage } from 'node:async_hooks';

import type { AuthObject } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/shared/types';

import type { AdditionalStateOptions } from './types';

/**
 * Per-request auth, bound to the async execution context rather than to the
 * React Router request `context`.
 *
 * `clerkMiddleware` also mirrors the auth onto the RR context (see
 * `authFnContext`), but that context is only per-request if React Router is the
 * one that creates it. Apps that return a single module-scoped
 * `RouterContextProvider` from a custom server / `getLoadContext` share one
 * context across every request, so concurrent requests overwrite each other's
 * auth and `getAuth` can resolve the wrong user (the reported cross-user bleed).
 *
 * `AsyncLocalStorage` keys by the running async context instead, which React
 * Router gives each request regardless of how the context object was
 * constructed, so `getAuth` reads the right user even when the context is
 * shared. It also survives the action -> loader revalidation hop, where React
 * Router mints a fresh `Request` object (so a request-keyed map would miss) but
 * the async scope is unchanged.
 *
 * Note: this module imports `node:async_hooks`, matching `@clerk/nextjs`'s
 * middleware storage. On a runtime without async storage, `getAuth` falls back
 * to the RR context slot (today's behavior).
 */
export type RequestAuthState = {
  authFn: (options?: PendingSessionOptions) => AuthObject;
  requestState: RequestState<any>;
  additionalState: AdditionalStateOptions;
};

export const requestAuthStorage = new AsyncLocalStorage<RequestAuthState>();
