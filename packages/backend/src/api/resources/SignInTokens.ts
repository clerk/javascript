import type { SignInTokenJSON } from './JSON';

/**
 * The Backend `SignInToken` object holds information about a sign-in token.
 */
export class SignInToken {
  constructor(
    /** The unique identifier for the token. */
    readonly id: string,
    /** The ID of the user the token is for. */
    readonly userId: string,
    /** The token itself. */
    readonly token: string,
    /** The status of the token. */
    readonly status: string,
    /** The URL the token is for. */
    readonly url: string,
    /** The Unix timestamp when the token was created. */
    readonly createdAt: number,
    /** The Unix timestamp when the token was last updated. */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: SignInTokenJSON): SignInToken {
    return new SignInToken(data.id, data.user_id, data.token, data.status, data.url, data.created_at, data.updated_at);
  }
}
