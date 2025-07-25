import type { AuthObject, InvalidTokenAuthObject, MachineAuthObject, SessionAuthObject } from '@clerk/backend';
import type {
  AuthenticateRequestOptions,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  SessionTokenType,
  TokenType,
} from '@clerk/backend/internal';

export type AuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export interface AuthFn {
  /**
   * @example
   * const auth = event.context.auth({ acceptsToken: ['session_token', 'api_key'] })
   */
  <T extends TokenType[]>(
    options: AuthOptions & { acceptsToken: T },
  ):
    | InferAuthObjectFromTokenArray<T, SessionAuthObject, MachineAuthObject<Exclude<T[number], SessionTokenType>>>
    | InvalidTokenAuthObject;

  /**
   * @example
   * const auth = event.context.auth({ acceptsToken: 'session_token' })
   */
  <T extends TokenType>(
    options: AuthOptions & { acceptsToken: T },
  ): InferAuthObjectFromToken<T, SessionAuthObject, MachineAuthObject<Exclude<T, SessionTokenType>>>;

  /**
   * @example
   * const auth = event.context.auth({ acceptsToken: 'any' })
   */
  (options: AuthOptions & { acceptsToken: 'any' }): AuthObject;

  /**
   * @example
   * const auth = event.context.auth()
   */
  (): SessionAuthObject;
}
