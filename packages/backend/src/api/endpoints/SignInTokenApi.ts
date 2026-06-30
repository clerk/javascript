import { joinPaths } from '../../util/path';
import type { SignInToken } from '../resources/SignInTokens';
import { AbstractAPI } from './AbstractApi';

/** @generateWithEmptyComment */
export type CreateSignInTokensParams = {
  /** The ID of the user to create the sign-in token for. */
  userId: string;
  /** The number of seconds until the sign-in token expires. By default, the duration is `2592000` (30 days). */
  expiresInSeconds: number;
};

const basePath = '/sign_in_tokens';

/** @generateWithEmptyComment */
export class SignInTokenAPI extends AbstractAPI {
  /**
   * Creates a new sign-in token for the given user. By default, sign-in tokens expire in 30 days. You can optionally specify a custom expiration time in seconds using the `expiresInSeconds` parameter.
   * @returns The created [`SignInToken`](https://clerk.com/docs/reference/backend/types/backend-sign-in-token) object.
   */
  public async createSignInToken(params: CreateSignInTokensParams) {
    return this.request<SignInToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Revokes the given sign-in token.
   * @param signInTokenId - The ID of the sign-in token to revoke.
   * @returns The revoked [`SignInToken`](https://clerk.com/docs/reference/backend/types/backend-sign-in-token) object.
   */
  public async revokeSignInToken(signInTokenId: string) {
    this.requireId(signInTokenId);
    return this.request<SignInToken>({
      method: 'POST',
      path: joinPaths(basePath, signInTokenId, 'revoke'),
    });
  }
}
