import { joinPaths } from '../../util/path';
import type { OAuthApplicationToken } from '../resources/OAuthApplicationToken';
import { AbstractAPI } from './AbstractApi';

const basePath = '/oauth_applications/access_tokens';

export class OAuthApplicationTokensApi extends AbstractAPI {
  async verifySecret(secret: string) {
    return this.request<OAuthApplicationToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
