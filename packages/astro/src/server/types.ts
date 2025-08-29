import type { AuthObject, InvalidTokenAuthObject, MachineAuthObject, SessionAuthObject } from '@clerk/backend';
import type {
  AuthenticateRequestOptions,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  RedirectFun,
  SessionTokenType,
  TokenType,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
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

export type AuthOptions = PendingSessionOptions & Pick<AuthenticateRequestOptions, 'acceptsToken'>;

type SessionAuthObjectWithRedirect = SessionAuthObject & {
  redirectToSignIn: RedirectFun<Response>;
};

export interface AuthFn {
  /**
   * @example
   * const auth = await context.locals.auth({ acceptsToken: ['session_token', 'api_key'] })
   */
  <T extends TokenType[]>(
    options: AuthOptions & { acceptsToken: T },
  ):
    | InferAuthObjectFromTokenArray<
        T,
        SessionAuthObjectWithRedirect,
        MachineAuthObject<Exclude<T[number], SessionTokenType>>
      >
    | InvalidTokenAuthObject;

  /**
   * @example
   * const auth = await context.locals.auth({ acceptsToken: 'session_token' })
   */
  <T extends TokenType>(
    options: AuthOptions & { acceptsToken: T },
  ): InferAuthObjectFromToken<T, SessionAuthObjectWithRedirect, MachineAuthObject<Exclude<T, SessionTokenType>>>;

  /**
   * @example
   * const auth = await context.locals.auth({ acceptsToken: 'any' })
   */
  (options: AuthOptions & { acceptsToken: 'any' }): AuthObject;

  /**
   * @example
   * const auth = await context.locals.auth()
   */
  (options?: PendingSessionOptions): SessionAuthObjectWithRedirect;
}
