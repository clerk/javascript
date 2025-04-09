import { joinPaths } from '../../util/path';
import { AbstractAPI } from './AbstractApi';

// TODO: Temporary response
interface VerifyOAuthAccessTokenResponse {
  id: string;
  subject: string;
  [key: string]: unknown;
}

const basePath = '/oauth_access_tokens';

export class OAuthAccessTokensAPI extends AbstractAPI {
  async verifyToken(secret: string): Promise<VerifyOAuthAccessTokenResponse> {
    return this.request({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
