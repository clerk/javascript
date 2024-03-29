import { joinPaths } from '../../util/path';
import type { SignInToken } from '../resources/SignInTokens';
import { AbstractAPI } from './AbstractApi';

type CreateSignInTokensParams = {
  userId: string;
  expiresInSeconds: number;
};

const basePath = '/sign_in_tokens';

export class SignInTokenAPI extends AbstractAPI {
  public async createSignInToken(params: CreateSignInTokensParams) {
    return this.request<SignInToken>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async revokeSignInToken(signInTokenId: string) {
    this.requireId(signInTokenId);
    return this.request<SignInToken>({
      method: 'POST',
      path: joinPaths(basePath, signInTokenId, 'revoke'),
    });
  }
}
