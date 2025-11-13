import type { SessionAuthObject } from '@clerk/backend';
import type { GetAuthFnNoRequest, RedirectFun } from '@clerk/backend/internal';
import type { APIContext } from 'astro';

/**
 * These types are copied from astro.
 * In Astro v3 and v4 both resolve in the save types, but
 * in v3 `MiddlewareNext` is a generic and in v4 it is not.
 */
type MiddlewareNext = () => Promise<Response>;
type MiddlewareHandler = (
  context: APIContext,
  next: MiddlewareNext,
) => Promise<Response> | Response | Promise<void> | void;

export type AstroMiddleware = MiddlewareHandler;
export type AstroMiddlewareContextParam = APIContext;
export type AstroMiddlewareNextParam = MiddlewareNext;
export type AstroMiddlewareReturn = Response | Promise<Response>;

export type SessionAuthObjectWithRedirect = SessionAuthObject & {
  redirectToSignIn: RedirectFun<Response>;
};

export type AuthFn = GetAuthFnNoRequest<SessionAuthObjectWithRedirect>;
