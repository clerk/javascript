import { joinPaths } from '../../util/path';
import { deprecated } from '../../util/shared';
import type { IdPOAuthAccessToken } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/oauth_applications/access_tokens';

export class IdPOAuthAccessTokenApi extends AbstractAPI {
  async verify(accessToken: string) {
    return this.request<IdPOAuthAccessToken>({
      method: 'POST',
      path: joinPaths(basePath, 'verify'),
      bodyParams: { access_token: accessToken },
    });
  }

  /**
   * @deprecated Use `verify()` instead. This method will be removed in the next major release.
   */
  async verifyAccessToken(accessToken: string) {
    deprecated('idPOAuthAccessToken.verifyAccessToken()', 'Use `idPOAuthAccessToken.verify()` instead.');
    return this.verify(accessToken);
  }
}
