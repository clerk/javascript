import { joinPaths } from '../../util/path';
import type { IdPOAuthAccessToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/oauth_applications/access_tokens';

export class IdPOAuthAccessTokenApi extends AbstractAPI {
  async verifySecret(secret: string) {
    return this.request<IdPOAuthAccessToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { secret },
    });
  }
}
