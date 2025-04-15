import { joinPaths } from '../../util/path';
import type { OauthApplicationToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/oauth_applications/access_tokens';

export class OauthApplicationTokensApi extends AbstractAPI {
  async verifySecret(secret: string) {
    return this.request<OauthApplicationToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
